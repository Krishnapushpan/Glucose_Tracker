require('dotenv').config();

// Use the test database. This must happen BEFORE the app is loaded.
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

const EMAILS = ['test.a@sweety.test', 'test.b@sweety.test'];
let tokenA;
let tokenB;

// Helper: add a reading as a given user
const addReading = (token, body) =>
  request(app)
    .post('/api/readings')
    .set('Authorization', `Bearer ${token}`)
    .send(body);

beforeAll(async () => {
  await db.initDb();
  await db.query('DELETE FROM users WHERE email = ANY($1)', [EMAILS]);

  const a = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User A', email: EMAILS[0], password: 'secret123' });
  const b = await request(app)
    .post('/api/auth/register')
    .send({ name: 'User B', email: EMAILS[1], password: 'secret123' });

  tokenA = a.body.token;
  tokenB = b.body.token;
});

afterAll(async () => {
  await db.query('DELETE FROM users WHERE email = ANY($1)', [EMAILS]);
  await db.pool.end();
});

describe('Readings need login', () => {
  test('request without a token is rejected', async () => {
    const res = await request(app).get('/api/readings');
    expect(res.status).toBe(401);
  });
});

describe('Reading validation', () => {
  const date = '2026-01-05';

  test('value is required', async () => {
    const res = await addReading(tokenA, { date, slot: 'morning' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Please enter a glucose value.');
  });

  test('value must be between 40 and 600', async () => {
    const res = await addReading(tokenA, { date, slot: 'morning', value: 700 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('value must be a whole number', async () => {
    const res = await addReading(tokenA, { date, slot: 'morning', value: 100.5 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Value must be between 40 and 600 mg/dl.');
  });

  test('date cannot be in the future', async () => {
    const res = await addReading(tokenA, { date: '2999-01-01', slot: 'morning', value: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Date cannot be in the future.');
  });

  test('only one reading per slot per day', async () => {
    const first = await addReading(tokenA, { date, slot: 'after_lunch', value: 130 });
    expect(first.status).toBe(201);

    const second = await addReading(tokenA, { date, slot: 'after_lunch', value: 140 });
    expect(second.status).toBe(400);
    expect(second.body.error).toBe('You already have an After lunch reading for this date.');
  });

  test('maximum 4 readings per day', async () => {
    const day = '2026-01-06';
    const slots = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];

    for (const slot of slots) {
      const res = await addReading(tokenA, { date: day, slot, value: 110 });
      expect(res.status).toBe(201);
    }

    const fifth = await addReading(tokenA, { date: day, slot: 'morning', value: 115 });
    expect(fifth.status).toBe(400);
    expect(fifth.body.error).toBe('You can add only 4 readings per day.');
  });
});

describe('Users only see their own readings', () => {
  test("another user cannot edit, delete or list someone else's reading", async () => {
    const created = await addReading(tokenA, { date: '2026-01-07', slot: 'morning', value: 100 });
    const id = created.body.reading.id;

    const edit = await request(app)
      .put(`/api/readings/${id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ date: '2026-01-07', slot: 'morning', value: 90 });
    expect(edit.status).toBe(404);

    const remove = await request(app)
      .delete(`/api/readings/${id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(remove.status).toBe(404);

    const list = await request(app)
      .get('/api/readings')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(list.body.readings).toHaveLength(0);
  });
});

describe('Daily report', () => {
  test('returns highest, lowest, average (1 decimal) and count', async () => {
    const day = '2026-01-10';
    await addReading(tokenB, { date: day, slot: 'morning', value: 100 });
    await addReading(tokenB, { date: day, slot: 'after_breakfast', value: 111 });
    await addReading(tokenB, { date: day, slot: 'after_lunch', value: 120 });

    const res = await request(app)
      .get(`/api/reports/daily?date=${day}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.body.report).toMatchObject({
      highest: 120,
      lowest: 100,
      average: 110.3,
      count: 3
    });
    expect(res.body.report.readings).toHaveLength(3);
  });

  test('a day with no readings returns an empty report', async () => {
    const res = await request(app)
      .get('/api/reports/daily?date=2026-01-02')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.body.report.hasData).toBe(false);
    expect(res.body.report.count).toBe(0);
  });
});