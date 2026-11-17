const db = require('../config/db');
const { SLOT_LABELS } = require('../utils/constants');
const { getReportRange, isValidDateString, todayString } = require('../utils/dateUtils');

function buildReport(type) {
  return async (req, res) => {
    try {
      const date = req.query.date || todayString();
      if (!isValidDateString(date)) {
        return res.status(400).json({ error: 'Please provide a valid date (YYYY-MM-DD).' });
      }

      const { from, to } = getReportRange(type, date);

      const { rows } = await db.query(
        `SELECT MAX(value_mg_dl) AS highest,
                MIN(value_mg_dl) AS lowest,
                ROUND(AVG(value_mg_dl)::numeric, 1) AS average,
                COUNT(*)::int AS count
         FROM readings
         WHERE user_id = $1 AND date BETWEEN $2 AND $3`,
        [req.user.id, from, to]
      );
      const s = rows[0];
      const hasData = s.count > 0;

      const report = {
        type, date, from, to,
        hasData,
        count: s.count,
        highest: hasData ? s.highest : null,
        lowest: hasData ? s.lowest : null,
        average: hasData ? Number(s.average) : null
      };

      if (type === 'daily') {
        const list = await db.query(
          `SELECT id, slot, value_mg_dl AS value FROM readings
           WHERE user_id = $1 AND date = $2
           ORDER BY CASE slot WHEN 'morning' THEN 1 WHEN 'after_breakfast' THEN 2
                              WHEN 'after_lunch' THEN 3 ELSE 4 END`,
          [req.user.id, date]
        );
        report.readings = list.rows.map((r) => ({ ...r, slotLabel: SLOT_LABELS[r.slot] }));
      }

      return res.json({ report });
    } catch (err) {
      console.error(`Report error (${type}):`, err);
      return res.status(500).json({ error: 'Server error while generating the report.' });
    }
  };
}

module.exports = {
  daily: buildReport('daily'),
  monthToDate: buildReport('month-to-date'),
  monthly: buildReport('monthly')
};