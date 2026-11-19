const { Pool, types } = require('pg');
require('dotenv').config();

// Ensure PostgreSQL DATE (type OID 1082) is returned as raw YYYY-MM-DD string
// to avoid UTC timezone offsets in JSON responses
types.setTypeParser(1082, (val) => val);

const connectionString = process.env.DATABASE_URL;

const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'glucose_db'
      }
);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

async function initDb() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS readings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      slot VARCHAR(50) NOT NULL,
      value_mg_dl INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_user_date_slot UNIQUE (user_id, date, slot)
    );

    CREATE INDEX IF NOT EXISTS idx_readings_user_date ON readings(user_id, date);
  `;
  try {
    await pool.query(initSql);
    console.log('✓ Database tables verified/initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database tables:', error.message);
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDb
};

