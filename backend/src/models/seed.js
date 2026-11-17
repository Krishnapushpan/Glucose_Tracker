require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { SLOTS } = require('../utils/constants');
const { todayString } = require('../utils/dateUtils');

const DEMO = { name: 'Demo User', email: 'demo@sweety.com', password: 'Demo@123' };
const BASE = { morning: 95, after_breakfast: 140, after_lunch: 135, after_dinner: 130 };

async function seed() {
  await db.initDb();

  // Re-create the demo user (readings are removed too via ON DELETE CASCADE)
  await db.query('DELETE FROM users WHERE email = $1', [DEMO.email]);
  const hash = await bcrypt.hash(DEMO.password, 10);
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [DEMO.name, DEMO.email, hash]
  );
  const userId = rows[0].id;

  // From the 1st of last month up to today
  const [y, m, d] = todayString().split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 2, 1));
  const end = new Date(Date.UTC(y, m - 1, d));

  let inserted = 0;
  for (let day = new Date(start), i = 0; day <= end; day.setUTCDate(day.getUTCDate() + 1), i++) {
    const date = day.toISOString().slice(0, 10);
    // Some days have fewer than 4 readings, to look realistic
    const perDay = i % 5 === 0 ? 2 : i % 7 === 3 ? 3 : 4;

    for (let s = 0; s < perDay; s++) {
      const slot = SLOTS[s];
      const value = BASE[slot] + ((i * 37 + s * 17) % 41) - 15; // deterministic variation
      await db.query(
        'INSERT INTO readings (user_id, date, slot, value_mg_dl) VALUES ($1, $2, $3, $4)',
        [userId, date, slot, value]
      );
      inserted++;
    }
  }

  console.log(`Seeded ${inserted} readings.`);
  console.log(`Demo login -> email: ${DEMO.email} | password: ${DEMO.password}`);
  await db.pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});