const db = require('../config/db');
const { SLOT_LABELS, SLOTS, MIN_VALUE, MAX_VALUE, MAX_READINGS_PER_DAY } = require('../utils/constants');
const { isValidDateString, todayString } = require('../utils/dateUtils');

const COLUMNS = 'id, date, slot, value_mg_dl AS value, created_at, updated_at';
const SLOT_ORDER_SQL = `CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2 WHEN 'after_lunch' THEN 3 ELSE 4 END`;

const format = (row) => ({ ...row, slotLabel: SLOT_LABELS[row.slot] });

function duplicateMessage(slot) {
  const label = SLOT_LABELS[slot] || 'this slot';
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `You already have ${article} ${label} reading for this date.`;
}

function validateInput({ date, slot, value }) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { error: 'Please enter a glucose value.' };
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < MIN_VALUE || num > MAX_VALUE) {
    return { error: 'Value must be between 40 and 600 mg/dl.' };
  }
  if (!isValidDateString(date)) return { error: 'Please enter a valid date (YYYY-MM-DD).' };
  if (date > todayString()) return { error: 'Date cannot be in the future.' };
  if (!SLOTS.includes(slot)) return { error: 'Please choose a valid time slot.' };
  return { data: { date, slot, value: num } };
}

// Max-per-day and one-per-slot rules. excludeId lets an edit ignore the row being edited.
async function checkDayRules(userId, date, slot, excludeId = null) {
  const params = [userId, date];
  let extra = '';
  if (excludeId) {
    params.push(excludeId);
    extra = 'AND id <> $3';
  }
  const { rows } = await db.query(
    `SELECT slot FROM readings WHERE user_id = $1 AND date = $2 ${extra}`,
    params
  );
  if (rows.length >= MAX_READINGS_PER_DAY) return 'You can add only 4 readings per day.';
  if (rows.some((r) => r.slot === slot)) return duplicateMessage(slot);
  return null;
}

async function createReading(req, res) {
  try {
    const { error, data } = validateInput(req.body);
    if (error) return res.status(400).json({ error });

    const ruleError = await checkDayRules(req.user.id, data.date, data.slot);
    if (ruleError) return res.status(400).json({ error: ruleError });

    const { rows } = await db.query(
      `INSERT INTO readings (user_id, date, slot, value_mg_dl)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [req.user.id, data.date, data.slot, data.value]
    );
    return res.status(201).json({ message: 'Reading added.', reading: format(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: duplicateMessage(req.body.slot) });
    }
    console.error('Create reading error:', err);
    return res.status(500).json({ error: 'Server error while saving the reading.' });
  }
}

async function listReadings(req, res) {
  try {
    const { date } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const params = [req.user.id];
    let where = 'user_id = $1';
    if (date) {
      if (!isValidDateString(date)) {
        return res.status(400).json({ error: 'Please provide a valid date (YYYY-MM-DD).' });
      }
      params.push(date);
      where += ` AND date = $${params.length}`;
    }

    const countResult = await db.query(`SELECT COUNT(*)::int AS total FROM readings WHERE ${where}`, params);
    const total = countResult.rows[0].total;

    const { rows } = await db.query(
      `SELECT ${COLUMNS} FROM readings WHERE ${where}
       ORDER BY date DESC, ${SLOT_ORDER_SQL}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]
    );

    return res.json({
      readings: rows.map(format),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('List readings error:', err);
    return res.status(500).json({ error: 'Server error while loading readings.' });
  }
}

async function updateReading(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(404).json({ error: 'Reading not found.' });

    const existing = await db.query('SELECT id FROM readings WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Reading not found.' });

    const { error, data } = validateInput(req.body);
    if (error) return res.status(400).json({ error });

    const ruleError = await checkDayRules(req.user.id, data.date, data.slot, id);
    if (ruleError) return res.status(400).json({ error: ruleError });

    const { rows } = await db.query(
      `UPDATE readings SET date = $1, slot = $2, value_mg_dl = $3, updated_at = NOW()
       WHERE id = $4 AND user_id = $5 RETURNING ${COLUMNS}`,
      [data.date, data.slot, data.value, id, req.user.id]
    );
    return res.json({ message: 'Reading updated.', reading: format(rows[0]) });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: duplicateMessage(req.body.slot) });
    }
    console.error('Update reading error:', err);
    return res.status(500).json({ error: 'Server error while updating the reading.' });
  }
}

async function deleteReading(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(404).json({ error: 'Reading not found.' });

    const { rows } = await db.query(
      'DELETE FROM readings WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reading not found.' });
    return res.json({ message: 'Reading deleted.' });
  } catch (err) {
    console.error('Delete reading error:', err);
    return res.status(500).json({ error: 'Server error while deleting the reading.' });
  }
}

module.exports = { createReading, listReadings, updateReading, deleteReading, validateInput };