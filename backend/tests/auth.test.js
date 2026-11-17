const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');
const bcrypt = require('bcryptjs');

// Mock database to test controller & validation logic independently
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  initDb: jest.fn(),
  pool: { end: jest.fn() }
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully and return token', async () => {
      // Mock existing user check (no user found)
      db.query.mockResolvedValueOnce({ rows: [] });

      // Mock user insertion
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: 'Jane Doe',
            email: 'jane@example.com',
            created_at: new Date().toISOString()
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toEqual({
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com'
      });
      // Ensure password is not returned
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject registration if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'not-an-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Please enter a valid email address.');
    });

    it('should reject registration if password is shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 6 characters long.');
    });

    it('should reject registration if email is already taken', async () => {
      // Mock user exists
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('An account with this email already exists.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('secret123', 10);

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            name: 'John Smith',
            email: 'john@example.com',
            password_hash: passwordHash
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'secret123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject login with wrong password', async () => {
      const passwordHash = await bcrypt.hash('correctPassword', 10);

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            name: 'John Smith',
            email: 'john@example.com',
            password_hash: passwordHash
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password.');
    });

    it('should reject login if email is not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password.');
    });
  });

  describe('Protected Route GET /api/auth/me', () => {
    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/Access token required/);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(response.status).toBe(403);
    });
  });
});

