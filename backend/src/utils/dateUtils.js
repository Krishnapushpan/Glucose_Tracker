const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n) => String(n).padStart(2, '0');

// Today as YYYY-MM-DD in the server's local timezone
function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Checks format AND that the date really exists (rejects 2026-02-31)
function isValidDateString(s) {
  if (typeof s !== 'string' || !DATE_REGEX.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

const toDateString = (dt) => dt.toISOString().slice(0, 10);

// Returns { from, to } (inclusive, YYYY-MM-DD) for a report type
function getReportRange(type, date) {
  const [y, m] = date.split('-').map(Number);
  if (type === 'daily') return { from: date, to: date };
  if (type === 'month-to-date') return { from: `${y}-${pad(m)}-01`, to: date };
  if (type === 'monthly') {
    // Whole previous month. Date.UTC handles January -> December of the previous year.
    return {
      from: toDateString(new Date(Date.UTC(y, m - 2, 1))),
      to: toDateString(new Date(Date.UTC(y, m - 1, 0)))
    };
  }
  return null;
}

module.exports = { todayString, isValidDateString, getReportRange };