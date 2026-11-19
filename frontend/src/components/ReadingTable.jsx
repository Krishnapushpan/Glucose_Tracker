import { useMemo, useState } from 'react';
import { Activity, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

function getStatusBadge(val) {
  if (val < 70) {
    return { label: 'Low', style: 'bg-[#ec4d43]/15 text-[#c9382f]' };
  }
  if (val > 140) {
    return { label: 'Elevated', style: 'bg-[#ec4d43]/15 text-[#c9382f]' };
  }
  return { label: 'In Range', style: 'bg-[#e3f1eb] text-[#267464]' };
}

export function formatDateDisplay(rawDate) {
  if (!rawDate) return '';
  const str = String(rawDate);
  if (str.includes('T')) {
    const d = new Date(str);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return str.slice(0, 10);
}

const PAGE_SIZE = 5;

export default function ReadingTable({ readings = [], onDeleteReading, loading = false }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(readings.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIdx = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedReadings = useMemo(() => {
    return readings.slice(startIdx, startIdx + PAGE_SIZE);
  }, [readings, startIdx]);

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-3xl border border-[#48a992]/20 bg-[#fafcf9] p-6 text-sm text-[#5b7670]">
        Loading your readings...
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#48a992]/30 bg-[#fafcf9] p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e3f1eb] text-[#267464]">
          <Activity className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="font-display mt-3 text-lg font-bold text-[#267464]">
          No readings logged yet
        </h3>
        <p className="mt-1 max-w-sm text-xs text-[#5b7670]">
          Use the form to record your first blood sugar reading for the day.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[#48a992]/20 bg-[#fafcf9] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#48a992]/15 px-6 py-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#267464]">
            Recorded Readings
          </h3>
          <p className="text-xs text-[#5b7670]">
            Review and manage your daily blood sugar entries
          </p>
        </div>
        <span className="rounded-full bg-[#e3f1eb] px-3 py-1 text-xs font-semibold text-[#267464]">
          {readings.length} total entries • 5 per page
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#2d4742]">
          <thead className="border-b border-[#48a992]/15 bg-[#f1f6f3]/60 text-xs font-semibold uppercase tracking-wider text-[#5b7670]">
            <tr>
              <th scope="col" className="px-6 py-3.5">Date</th>
              <th scope="col" className="px-6 py-3.5">Slot</th>
              <th scope="col" className="px-6 py-3.5">Value</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#48a992]/10">
            {paginatedReadings.map((r) => {
              const status = getStatusBadge(r.value);
              return (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-[#e3f1eb]/30"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-[#2d4742]">
                    {formatDateDisplay(r.date)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-[#1e6355]">
                    {r.slotLabel || r.slot}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-display text-base font-bold text-[#267464]">
                      {r.value}
                    </span>
                    <span className="ml-1 text-xs text-[#6d8781]">mg/dL</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.style}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteReading(r.id)}
                      aria-label={`Delete reading for ${r.slotLabel || r.slot} on ${r.date}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#6d8781] transition-colors hover:bg-[#ec4d43]/10 hover:text-[#c9382f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ec4d43]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Limited to 6 rows per page) */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-[#48a992]/15 bg-[#fafcf9] px-6 py-3.5 sm:flex-row">
        <p className="text-xs text-[#5b7670]">
          Showing{' '}
          <span className="font-semibold text-[#267464]">{startIdx + 1}</span> to{' '}
          <span className="font-semibold text-[#267464]">
            {Math.min(startIdx + PAGE_SIZE, readings.length)}
          </span>{' '}
          of <span className="font-semibold text-[#267464]">{readings.length}</span> readings
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="inline-flex items-center gap-1 rounded-full border border-[#48a992]/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Previous</span>
            </button>

            <span className="px-2 text-xs font-semibold text-[#5b7670]">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-[#48a992]/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
