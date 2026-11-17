const { getReportRange, isValidDateString } = require('../src/utils/dateUtils');

describe('getReportRange', () => {
  test('daily is the selected date only', () => {
    expect(getReportRange('daily', '2026-10-15')).toEqual({
      from: '2026-10-15',
      to: '2026-10-15'
    });
  });

  test('month-to-date runs from the 1st to the selected date', () => {
    expect(getReportRange('month-to-date', '2026-10-15')).toEqual({
      from: '2026-10-01',
      to: '2026-10-15'
    });
  });

  test('monthly is the whole previous month', () => {
    expect(getReportRange('monthly', '2026-10-15')).toEqual({
      from: '2026-09-01',
      to: '2026-09-30'
    });
  });

  test('monthly in January goes back to December of the previous year', () => {
    expect(getReportRange('monthly', '2026-01-20')).toEqual({
      from: '2025-12-01',
      to: '2025-12-31'
    });
  });

  test('monthly in March handles the length of February', () => {
    expect(getReportRange('monthly', '2026-03-10')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28'
    });
  });
});

describe('isValidDateString', () => {
  test('accepts a real date', () => {
    expect(isValidDateString('2026-10-15')).toBe(true);
  });

  test('rejects a date that does not exist', () => {
    expect(isValidDateString('2026-02-31')).toBe(false);
  });

  test('rejects the wrong format', () => {
    expect(isValidDateString('15-10-2026')).toBe(false);
  });
});