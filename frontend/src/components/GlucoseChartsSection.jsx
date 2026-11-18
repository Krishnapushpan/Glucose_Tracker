import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import ReportCard from './ReportCard';

const SLOTS = [
  { key: 'morning', label: 'Morning (Fasting)', shortLabel: 'Morning' },
  { key: 'after_breakfast', label: 'After Breakfast', shortLabel: 'Breakfast' },
  { key: 'after_lunch', label: 'After Lunch', shortLabel: 'Lunch' },
  { key: 'after_dinner', label: 'After Dinner', shortLabel: 'Dinner' },
];

const TARGET_MIN = 70;
const TARGET_MAX = 140;

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateISO(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatReadableDate(dateStr) {
  const d = parseDateISO(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthLabel(dateStr) {
  const d = parseDateISO(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getStatusInfo(value) {
  if (value < TARGET_MIN) {
    return { label: 'Low', color: '#ec4d43', pill: 'bg-[#ec4d43]/15 text-[#c9382f]' };
  }
  if (value > TARGET_MAX) {
    return { label: 'Elevated', color: '#ec4d43', pill: 'bg-[#ec4d43]/15 text-[#c9382f]' };
  }
  return { label: 'In Range', color: '#48a992', pill: 'bg-[#e3f1eb] text-[#267464]' };
}

// Deterministic pseudo-random helper so each date consistently displays realistic glucose readings
function seededWave(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function getSampleReadingsForDate(dateStr, todayStr) {
  if (!dateStr || dateStr > todayStr) return [];

  const date = parseDateISO(dateStr);
  const seedBase =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  const slotBaselines = [
    { key: 'morning', base: 92, spread: 18 },
    { key: 'after_breakfast', base: 122, spread: 28 },
    { key: 'after_lunch', base: 128, spread: 34 },
    { key: 'after_dinner', base: 116, spread: 28 },
  ];

  return slotBaselines.map((item, idx) => {
    const r = seededWave(seedBase + idx * 37);
    // Occasional slightly elevated post-meal spike for realistic variation
    const spike = idx === 2 && seededWave(seedBase + 91) > 0.72 ? 18 : 0;
    const value = Math.round(item.base + (r - 0.35) * item.spread + spike);
    const meta = SLOTS[idx];
    return {
      slot: meta.key,
      slotLabel: meta.label,
      shortLabel: meta.shortLabel,
      value,
    };
  });
}

function getSampleMonthSeries(dateStr, todayStr) {
  const selected = parseDateISO(dateStr);
  const year = selected.getFullYear();
  const month = selected.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  const allValues = [];
  const slotTotals = {
    morning: { sum: 0, count: 0 },
    after_breakfast: { sum: 0, count: 0 },
    after_lunch: { sum: 0, count: 0 },
    after_dinner: { sum: 0, count: 0 },
  };

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dayStr > todayStr) break;

    const readings = getSampleReadingsForDate(dayStr, todayStr);
    if (readings.length === 0) continue;

    const values = readings.map((r) => r.value);
    const avg = Number(
      (values.reduce((acc, v) => acc + v, 0) / values.length).toFixed(1)
    );
    const high = Math.max(...values);
    const low = Math.min(...values);

    readings.forEach((r) => {
      allValues.push(r.value);
      slotTotals[r.slot].sum += r.value;
      slotTotals[r.slot].count += 1;
    });

    days.push({
      day,
      date: dayStr,
      average: avg,
      highest: high,
      lowest: low,
      count: readings.length,
    });
  }

  const hasData = allValues.length > 0;
  const slotAverages = SLOTS.map((slot) => {
    const entry = slotTotals[slot.key];
    return {
      ...slot,
      average:
        entry.count > 0 ? Number((entry.sum / entry.count).toFixed(1)) : null,
    };
  });

  return {
    days,
    daysInMonth,
    slotAverages,
    summary: {
      hasData,
      count: allValues.length,
      highest: hasData ? Math.max(...allValues) : null,
      lowest: hasData ? Math.min(...allValues) : null,
      average: hasData
        ? Number(
            (allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(1)
          )
        : null,
    },
  };
}

function DailyChart({ readings }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (readings.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#48a992]/30 bg-[#f1f6f3]/60 px-6 text-center">
        <Activity className="h-9 w-9 text-[#48a992]/70" aria-hidden="true" />
        <p className="font-display mt-3 text-lg font-bold text-[#267464]">
          No readings recorded for this date
        </p>
        <p className="mt-1 max-w-sm text-sm text-[#5b7670]">
          Select today or an earlier date to explore the daily meal-slot glucose chart.
        </p>
      </div>
    );
  }

  const width = 760;
  const height = 300;
  const pad = { top: 28, right: 32, bottom: 50, left: 56 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxData = Math.max(...readings.map((r) => r.value), 165);
  const yMin = 50;
  const yMax = Math.ceil((maxData + 15) / 20) * 20;

  const yScale = (val) =>
    pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const stepX = plotW / readings.length;
  const points = readings.map((r, i) => ({
    ...r,
    x: pad.left + stepX * i + stepX / 2,
    y: yScale(r.value),
    status: getStatusInfo(r.value),
  }));

  const gridTicks = [];
  for (let v = 60; v <= yMax; v += 30) {
    gridTicks.push(v);
  }

  const targetTop = yScale(Math.min(TARGET_MAX, yMax));
  const targetBottom = yScale(Math.max(TARGET_MIN, yMin));

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const hovered =
    activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Daily blood glucose readings by meal slot"
          className="h-auto min-w-[520px] w-full select-none"
        >
          {/* Target Range Band (70 - 140 mg/dL) */}
          <rect
            x={pad.left}
            y={targetTop}
            width={plotW}
            height={Math.max(0, targetBottom - targetTop)}
            rx="6"
            fill="#48a992"
            fillOpacity="0.11"
          />
          <text
            x={pad.left + plotW - 6}
            y={targetTop + 15}
            textAnchor="end"
            fill="#267464"
            fontSize="11"
            fontWeight="600"
            opacity="0.85"
          >
            Target Range ({TARGET_MIN}–{TARGET_MAX} mg/dL)
          </text>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {gridTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={pad.left + plotW}
                  y2={y}
                  stroke="#48a992"
                  strokeOpacity="0.18"
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#5b7670"
                  fontSize="11"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars for each slot */}
          {points.map((p, idx) => {
            const barW = 54;
            const barH = Math.max(8, pad.top + plotH - p.y);
            const isHovered = activeIndex === idx;
            return (
              <g
                key={p.slot}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(idx)}
                onBlur={() => setActiveIndex(null)}
                tabIndex={0}
                role="button"
                aria-label={`${p.slotLabel}: ${p.value} mg/dL (${p.status.label})`}
                className="cursor-pointer outline-none"
              >
                <rect
                  x={p.x - barW / 2}
                  y={p.y}
                  width={barW}
                  height={barH}
                  rx="14"
                  fill={p.status.color}
                  fillOpacity={isHovered ? 0.34 : 0.2}
                  className="transition-all duration-150"
                />
                {/* X-axis label */}
                <text
                  x={p.x}
                  y={height - 20}
                  textAnchor="middle"
                  fill={isHovered ? '#1e6355' : '#45605a'}
                  fontSize="12"
                  fontWeight={isHovered ? '700' : '600'}
                >
                  {p.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Connecting Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#267464"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Nodes + Value Labels */}
          {points.map((p, idx) => {
            const isHovered = activeIndex === idx;
            return (
              <g
                key={`node-${p.slot}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="13"
                    fill={p.status.color}
                    fillOpacity="0.22"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7.5 : 6}
                  fill={p.status.color}
                  stroke="#fafcf9"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                />
                <text
                  x={p.x}
                  y={p.y - 14}
                  textAnchor="middle"
                  fill="#1e6355"
                  fontSize="12.5"
                  fontWeight="700"
                >
                  {p.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Banner / Slot Breakdown */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p, idx) => {
          const isHovered = activeIndex === idx;
          return (
            <button
              key={p.slot}
              type="button"
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(idx)}
              onBlur={() => setActiveIndex(null)}
              className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition-all ${
                isHovered
                  ? 'border-[#48a992] bg-[#e3f1eb]/75 shadow-sm'
                  : 'border-[#48a992]/15 bg-[#f1f6f3]/75 hover:border-[#48a992]/35'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-[#2d4742]">
                  {p.slotLabel}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.status.pill}`}
                >
                  {p.status.label}
                </span>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-[#267464]">
                  {p.value}
                </p>
                <p className="text-[11px] text-[#6d8781]">mg/dL</p>
              </div>
            </button>
          );
        })}
      </div>

      {hovered && (
        <div
          role="status"
          className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#48a992]/25 bg-[#e9f3ee]/80 px-4 py-2 text-xs text-[#267464]"
        >
          <span className="font-semibold">{hovered.slotLabel}</span>
          <span>
            Recorded level: <strong>{hovered.value} mg/dL</strong> ({hovered.status.label})
          </span>
        </div>
      )}
    </div>
  );
}

function MonthlyChart({ monthData }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const { days, daysInMonth, slotAverages } = monthData;

  if (days.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#48a992]/30 bg-[#f1f6f3]/60 px-6 text-center">
        <TrendingUp className="h-9 w-9 text-[#48a992]/70" aria-hidden="true" />
        <p className="font-display mt-3 text-lg font-bold text-[#267464]">
          No readings recorded for this month
        </p>
        <p className="mt-1 max-w-sm text-sm text-[#5b7670]">
          Choose the current month or an earlier date to view monthly glucose level trends.
        </p>
      </div>
    );
  }

  const width = 760;
  const height = 310;
  const pad = { top: 28, right: 28, bottom: 48, left: 56 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxVal = Math.max(...days.map((d) => d.average), 160);
  const yMin = 60;
  const yMax = Math.ceil((maxVal + 15) / 20) * 20;

  const xScale = (dayNum) =>
    pad.left + ((dayNum - 1) / Math.max(1, daysInMonth - 1)) * plotW;
  const yScale = (val) =>
    pad.top + plotH - ((val - yMin) / (yMax - yMin)) * plotH;

  const points = days.map((d) => ({
    ...d,
    x: xScale(d.day),
    y: yScale(d.average),
    status: getStatusInfo(d.average),
  }));

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${pad.top + plotH} L ${points[0].x} ${pad.top + plotH} Z`
      : '';

  const gridTicks = [];
  for (let v = 60; v <= yMax; v += 30) {
    gridTicks.push(v);
  }

  const xTicks = [1, 5, 10, 15, 20, 25, daysInMonth].filter(
    (d, idx, arr) => d <= daysInMonth && arr.indexOf(d) === idx
  );

  const targetTop = yScale(Math.min(TARGET_MAX, yMax));
  const targetBottom = yScale(Math.max(TARGET_MIN, yMin));

  const hovered =
    activeIndex !== null && points[activeIndex]
      ? points[activeIndex]
      : points[points.length - 1];

  return (
    <div className="relative">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Monthly daily average blood glucose trend chart"
          className="h-auto min-w-[540px] w-full select-none"
        >
          <defs>
            <linearGradient id="monthlyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#48a992" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#48a992" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Target Range Band */}
          <rect
            x={pad.left}
            y={targetTop}
            width={plotW}
            height={Math.max(0, targetBottom - targetTop)}
            rx="6"
            fill="#48a992"
            fillOpacity="0.1"
          />
          <text
            x={pad.left + plotW - 6}
            y={targetTop + 15}
            textAnchor="end"
            fill="#267464"
            fontSize="11"
            fontWeight="600"
            opacity="0.85"
          >
            Target Range ({TARGET_MIN}–{TARGET_MAX} mg/dL)
          </text>

          {/* Y Gridlines */}
          {gridTicks.map((tick) => {
            const y = yScale(tick);
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={pad.left + plotW}
                  y2={y}
                  stroke="#48a992"
                  strokeOpacity="0.18"
                  strokeDasharray="4 4"
                />
                <text
                  x={pad.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fill="#5b7670"
                  fontSize="11"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* X Axis Day Ticks */}
          {xTicks.map((dayTick) => (
            <text
              key={dayTick}
              x={xScale(dayTick)}
              y={height - 16}
              textAnchor="middle"
              fill="#5b7670"
              fontSize="11"
              fontWeight="600"
            >
              Day {dayTick}
            </text>
          ))}

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#monthlyAreaGrad)" />}

          {/* Active Vertical Guide */}
          {hovered && (
            <line
              x1={hovered.x}
              y1={pad.top}
              x2={hovered.x}
              y2={pad.top + plotH}
              stroke="#267464"
              strokeOpacity="0.25"
              strokeDasharray="3 3"
            />
          )}

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#267464"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Day Nodes */}
          {points.map((p, idx) => {
            const isSelected = hovered && hovered.date === p.date;
            return (
              <g
                key={p.date}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(idx)}
                onFocus={() => setActiveIndex(idx)}
                tabIndex={0}
                role="button"
                aria-label={`${formatReadableDate(p.date)}: average ${p.average} mg/dL, high ${p.highest}, low ${p.lowest}`}
                className="cursor-pointer outline-none"
              >
                {/* Invisible wider hit target */}
                <circle cx={p.x} cy={p.y} r="13" fill="transparent" />
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="9.5"
                    fill={p.status.color}
                    fillOpacity="0.25"
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5.5 : 3.8}
                  fill={p.status.color}
                  stroke="#fafcf9"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Day Inspector Bar */}
      {hovered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#48a992]/25 bg-[#e9f3ee]/80 px-4 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: hovered.status.color }}
            />
            <span className="font-semibold text-[#1e6355]">
              {formatReadableDate(hovered.date)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${hovered.status.pill}`}
            >
              {hovered.status.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[#35524c]">
            <span>
              Avg: <strong className="text-[#267464]">{hovered.average}</strong> mg/dL
            </span>
            <span>
              High: <strong className="text-[#ec4d43]">{hovered.highest}</strong>
            </span>
            <span>
              Low: <strong className="text-[#48a992]">{hovered.lowest}</strong>
            </span>
            <span className="text-[#5b7670]">{hovered.count} readings</span>
          </div>
        </div>
      )}

      {/* Monthly Averages by Meal Slot */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {slotAverages.map((slot) => (
          <div
            key={slot.key}
            className="flex items-center justify-between rounded-2xl border border-[#48a992]/15 bg-[#f1f6f3]/75 px-3.5 py-2.5"
          >
            <span className="text-xs font-semibold text-[#35524c]">
              {slot.label}
            </span>
            <span className="font-display text-base font-bold text-[#267464]">
              {slot.average ?? '—'}{' '}
              <span className="font-sans text-[11px] font-normal text-[#6d8781]">
                mg/dL
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GlucoseChartsSection() {
  const todayStr = useMemo(() => formatDateISO(new Date()), []);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dailyReadings = useMemo(
    () => getSampleReadingsForDate(selectedDate, todayStr),
    [selectedDate, todayStr]
  );

  const dailySummary = useMemo(() => {
    if (dailyReadings.length === 0) {
      return { hasData: false, count: 0, highest: null, lowest: null, average: null };
    }
    const vals = dailyReadings.map((r) => r.value);
    return {
      hasData: true,
      count: vals.length,
      highest: Math.max(...vals),
      lowest: Math.min(...vals),
      average: Number(
        (vals.reduce((sum, v) => sum + v, 0) / vals.length).toFixed(1)
      ),
    };
  }, [dailyReadings]);

  const monthData = useMemo(
    () => getSampleMonthSeries(selectedDate, todayStr),
    [selectedDate, todayStr]
  );

  const activeSummary = viewMode === 'daily' ? dailySummary : monthData.summary;

  function stepDate(direction) {
    const current = parseDateISO(selectedDate);
    if (viewMode === 'daily') {
      current.setDate(current.getDate() + direction);
    } else {
      current.setMonth(current.getMonth() + direction);
    }
    const nextStr = formatDateISO(current);
    if (nextStr > todayStr) {
      setSelectedDate(todayStr);
    } else {
      setSelectedDate(nextStr);
    }
  }

  const isNextDisabled = useMemo(() => {
    const current = parseDateISO(selectedDate);
    if (viewMode === 'daily') {
      return selectedDate >= todayStr;
    }
    const today = parseDateISO(todayStr);
    return (
      current.getFullYear() > today.getFullYear() ||
      (current.getFullYear() === today.getFullYear() &&
        current.getMonth() >= today.getMonth())
    );
  }, [selectedDate, todayStr, viewMode]);

  return (
    <section
      id="glucose-charts"
      aria-labelledby="glucose-charts-heading"
      className="relative scroll-mt-20 border-t border-[#48a992]/20 bg-[#f1f6f3] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header & Controls */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#48a992]/35 bg-[#fafcf9] px-3.5 py-1 text-xs font-semibold text-[#267464]">
              <TrendingUp className="h-3.5 w-3.5 text-[#48a992]" aria-hidden="true" />
              <span>Glucose Level Analytics</span>
              <span className="rounded-full bg-[#e3f1eb] px-2 py-0.5 text-[10px] font-semibold text-[#267464]">
                Preview Data
              </span>
            </div>

            <h2
              id="glucose-charts-heading"
              className="font-display mt-3 text-3xl font-bold tracking-tight text-[#267464] sm:text-4xl"
            >
              Daily &amp; Monthly Glucose Levels
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4e6b64] sm:text-base">
              Switch between daily meal-slot readings and full monthly trends to
              understand how your blood glucose moves over time.
            </p>
          </div>

          {/* Controls: Daily/Monthly Toggle + Date Picker */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div
              role="tablist"
              aria-label="Chart timeframe"
              className="inline-flex rounded-full border border-[#48a992]/30 bg-[#fafcf9] p-1 shadow-sm"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'daily'}
                onClick={() => setViewMode('daily')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  viewMode === 'daily'
                    ? 'bg-[#48a992] text-[#faf7f4] shadow-sm'
                    : 'text-[#45605a] hover:text-[#267464]'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'monthly'}
                onClick={() => setViewMode('monthly')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  viewMode === 'monthly'
                    ? 'bg-[#48a992] text-[#faf7f4] shadow-sm'
                    : 'text-[#45605a] hover:text-[#267464]'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Date Picker with Step Buttons */}
            <div className="inline-flex items-center gap-1 rounded-full border border-[#48a992]/30 bg-[#fafcf9] px-2 py-1 shadow-sm">
              <button
                type="button"
                onClick={() => stepDate(-1)}
                aria-label={
                  viewMode === 'daily' ? 'Previous day' : 'Previous month'
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#267464] transition-colors hover:bg-[#e3f1eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <label className="relative flex items-center gap-1.5 px-1 text-xs font-semibold text-[#2d4742]">
                <Calendar
                  className="h-3.5 w-3.5 text-[#48a992]"
                  aria-hidden="true"
                />
                <span className="sr-only">Select date</span>
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  className="cursor-pointer bg-transparent text-xs font-semibold text-[#267464] focus:outline-none sm:text-sm"
                />
              </label>

              <button
                type="button"
                onClick={() => stepDate(1)}
                disabled={isNextDisabled}
                aria-label={viewMode === 'daily' ? 'Next day' : 'Next month'}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#267464] transition-colors hover:bg-[#e3f1eb] disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Report Cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ReportCard
            label="Average"
            value={activeSummary.average}
            unit="mg/dL"
            subtext={
              viewMode === 'daily'
                ? 'Mean across meal slots'
                : `Mean across ${monthData.days.length} tracked days`
            }
            icon={Activity}
            accent="teal"
          />
          <ReportCard
            label="Highest"
            value={activeSummary.highest}
            unit="mg/dL"
            subtext={
              activeSummary.highest && activeSummary.highest > TARGET_MAX
                ? 'Above 140 mg/dL target'
                : 'Within healthy target'
            }
            icon={ArrowUpRight}
            accent="coral"
          />
          <ReportCard
            label="Lowest"
            value={activeSummary.lowest}
            unit="mg/dL"
            subtext={
              activeSummary.lowest && activeSummary.lowest < TARGET_MIN
                ? 'Below 70 mg/dL target'
                : 'Steady baseline reading'
            }
            icon={ArrowDownRight}
            accent="sage"
          />
          <ReportCard
            label="Readings"
            value={activeSummary.count}
            unit={viewMode === 'daily' ? '/ 4 slots' : 'entries'}
            subtext={
              viewMode === 'daily'
                ? formatReadableDate(selectedDate)
                : formatMonthLabel(selectedDate)
            }
            icon={ClipboardList}
            accent="forest"
          />
        </div>

        {/* Interactive Chart Card */}
        <div className="mt-6 rounded-3xl border border-[#48a992]/25 bg-[#fafcf9] p-5 shadow-md shadow-[#1e6355]/5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#48a992]/15 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#267464] sm:text-xl">
                {viewMode === 'daily'
                  ? `Daily Glucose Breakdown — ${formatReadableDate(selectedDate)}`
                  : `Monthly Glucose Trend — ${formatMonthLabel(selectedDate)}`}
              </h3>
              <p className="mt-0.5 text-xs text-[#5b7670] sm:text-sm">
                {viewMode === 'daily'
                  ? 'Hover or select a meal slot below to inspect its reading.'
                  : 'Hover or tap any day point along the curve to inspect its daily average, high, and low.'}
              </p>
            </div>

            {/* Compact Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-[#4e6b64]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#48a992]" />
                In Range (70–140)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec4d43]" />
                Out of Range
              </span>
            </div>
          </div>

          {viewMode === 'daily' ? (
            <DailyChart readings={dailyReadings} />
          ) : (
            <MonthlyChart monthData={monthData} />
          )}
        </div>
      </div>
    </section>
  );
}
