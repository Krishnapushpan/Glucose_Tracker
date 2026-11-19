import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Info, Pencil, PlusCircle, X } from 'lucide-react';
import { apiRequest } from '../api';
import { formatDateDisplay } from './ReadingTable';

const SLOTS = [
  { value: 'morning', label: 'Morning (fasting)' },
  { value: 'after_breakfast', label: 'After breakfast' },
  { value: 'after_lunch', label: 'After lunch' },
  { value: 'after_dinner', label: 'After dinner' },
];

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ReadingForm({
  onReadingAdded,
  onReadingUpdated,
  editingReading = null,
  onCancelEdit,
  allReadings = [],
}) {
  const today = getTodayString();
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState('morning');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(editingReading);

  // When editing reading changes, load its values into the form
  useEffect(() => {
    if (editingReading) {
      setDate(formatDateDisplay(editingReading.date) || today);
      setSlot(editingReading.slot || 'morning');
      setValue(editingReading.value !== undefined ? String(editingReading.value) : '');
      setError('');
      setSuccess('');
    }
  }, [editingReading, today]);

  function handleCancel() {
    setDate(today);
    setSlot('morning');
    setValue('');
    setError('');
    setSuccess('');
    if (onCancelEdit) {
      onCancelEdit();
    }
  }

  // Slots already logged for whichever date is currently selected in the date input.
  // When editing, exclude the reading currently being edited from the conflict list.
  const existingSlotsForSelectedDate = useMemo(() => {
    return allReadings
      .filter((r) => {
        if (editingReading && r.id === editingReading.id) return false;
        return formatDateDisplay(r.date) === date;
      })
      .map((r) => r.slot);
  }, [allReadings, date, editingReading]);

  const isDayFull = existingSlotsForSelectedDate.length >= 4;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isDayFull) {
      setError(
        'You have already recorded all 4 slots for this date. You can select yesterday or another previous date, or delete an existing reading from the table.'
      );
      return;
    }

    // Client-side validation
    if (!value || String(value).trim() === '') {
      setError('Please enter a glucose value.');
      return;
    }

    const num = Number(value);
    if (!Number.isInteger(num) || num < 40 || num > 600) {
      setError('Value must be between 40 and 600 mg/dl.');
      return;
    }

    if (date > today) {
      setError('Date cannot be in the future.');
      return;
    }

    if (existingSlotsForSelectedDate.includes(slot)) {
      const slotObj = SLOTS.find((s) => s.value === slot);
      setError(
        `You already have a reading for ${slotObj?.label || slot} on ${date}. Please choose another meal slot.`
      );
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const response = await apiRequest(`/readings/${editingReading.id}`, {
          method: 'PUT',
          body: { date, slot, value: num },
        });

        setSuccess(`Reading updated to ${num} mg/dL successfully!`);
        if (onReadingUpdated) {
          onReadingUpdated(response.reading);
        }
      } else {
        const response = await apiRequest('/readings', {
          method: 'POST',
          body: { date, slot, value: num },
        });

        setSuccess(`Reading of ${num} mg/dL recorded successfully!`);
        setValue('');
        if (onReadingAdded) {
          onReadingAdded(response.reading);
        }
      }
    } catch (err) {
      setError(err.message || (isEditing ? 'Failed to update reading.' : 'Failed to save reading.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id="reading-form-card"
      className="scroll-mt-24 rounded-3xl border border-[#48a992]/20 bg-[#fafcf9] p-6 shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 border-b border-[#48a992]/15 pb-4">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isEditing ? 'bg-[#48a992] text-white shadow-sm' : 'bg-[#e3f1eb] text-[#267464]'
          }`}
        >
          {isEditing ? (
            <Pencil className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PlusCircle className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#267464]">
              {isEditing ? 'Edit Glucose Reading' : 'Log Glucose Reading'}
            </h2>
            {isEditing && (
              <span className="rounded-full bg-[#e3f1eb] px-2.5 py-0.5 text-[11px] font-semibold text-[#1e6355]">
                Edit Mode
              </span>
            )}
          </div>
          <p className="text-xs text-[#5b7670]">
            {isEditing
              ? `Updating reading #${editingReading.id} (${editingReading.slotLabel || editingReading.slot})`
              : 'Enter your blood sugar reading (40–600 mg/dL)'}
          </p>
        </div>
      </div>

      {isEditing && (
        <div
          role="status"
          className="mt-4 flex items-center justify-between gap-2.5 rounded-2xl border border-[#48a992]/40 bg-[#e3f1eb]/70 p-3 text-xs text-[#1e6355]"
        >
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 shrink-0 text-[#267464]" aria-hidden="true" />
            <span>
              Editing <strong>{editingReading.slotLabel || editingReading.slot}</strong> for{' '}
              <strong>{formatDateDisplay(editingReading.date)}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 rounded-full border border-[#48a992]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#267464] shadow-sm transition-colors hover:bg-[#fafcf9]"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            <span>Cancel</span>
          </button>
        </div>
      )}

      {isDayFull && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#48a992]/35 bg-[#e3f1eb] p-3.5 text-xs text-[#1e6355]"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#267464]" aria-hidden="true" />
          <span>
            All 4 meal slots are already recorded for this date (4/4). You can select <strong>yesterday</strong> or any previous date above to log past readings, or delete a reading in the table to change it.
          </span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#ec4d43]/30 bg-[#ec4d43]/10 p-3.5 text-xs font-medium text-[#c9382f]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#48a992]/35 bg-[#e3f1eb] p-3.5 text-xs font-semibold text-[#1e6355]"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#267464]" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        {/* Date Input */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="reading-date"
              className="text-xs font-semibold text-[#2d4742]"
            >
              Date
            </label>
            <span className="text-[11px] font-medium text-[#5b7670]">
              {existingSlotsForSelectedDate.length}/4 slots logged
            </span>
          </div>
          <input
            id="reading-date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError('');
              setSuccess('');
            }}
            className="w-full rounded-xl border border-[#48a992]/30 bg-white px-3.5 py-2.5 text-sm font-medium text-[#2d4742] transition-colors focus:border-[#48a992] focus:outline-none focus:ring-2 focus:ring-[#48a992]/20"
          />
          <p className="mt-1 text-[11px] text-[#6d8781]">
            You can log readings for today or any past date (yesterday, previous days).
          </p>
        </div>

        {/* Meal Slot Selector */}
        <div>
          <label
            htmlFor="reading-slot"
            className="mb-1.5 block text-xs font-semibold text-[#2d4742]"
          >
            Meal Slot
          </label>
          <select
            id="reading-slot"
            value={slot}
            onChange={(e) => {
              setSlot(e.target.value);
              setError('');
              setSuccess('');
            }}
            className="w-full rounded-xl border border-[#48a992]/30 bg-white px-3.5 py-2.5 text-sm font-medium text-[#2d4742] transition-colors focus:border-[#48a992] focus:outline-none focus:ring-2 focus:ring-[#48a992]/20"
          >
            {SLOTS.map((s) => {
              const alreadyLogged = existingSlotsForSelectedDate.includes(s.value);
              return (
                <option
                  key={s.value}
                  value={s.value}
                  disabled={alreadyLogged}
                  className={alreadyLogged ? 'text-slate-400' : ''}
                >
                  {s.label} {alreadyLogged ? '✓ (already recorded)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Glucose Value Input */}
        <div>
          <label
            htmlFor="reading-value"
            className="mb-1.5 block text-xs font-semibold text-[#2d4742]"
          >
            Glucose Value (mg/dL)
          </label>
          <div className="relative">
            <input
              id="reading-value"
              type="number"
              min="40"
              max="600"
              step="1"
              placeholder="e.g. 110"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
                setSuccess('');
              }}
              className="w-full rounded-xl border border-[#48a992]/30 bg-white py-2.5 pl-3.5 pr-16 text-sm font-semibold text-[#2d4742] placeholder:text-[#8aa39d] transition-colors focus:border-[#48a992] focus:outline-none focus:ring-2 focus:ring-[#48a992]/20"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#6d8781]">
              mg/dL
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#6d8781]">
            Valid range: 40 to 600 mg/dL • Up to 4 readings per day
          </p>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || isDayFull}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#48a992] px-5 py-3 text-sm font-semibold text-[#faf7f4] shadow-sm shadow-[#267464]/20 transition-all hover:bg-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {isDayFull
                ? 'All 4 Slots Logged for This Date'
                : submitting
                ? isEditing
                  ? 'Updating Reading...'
                  : 'Saving Reading...'
                : isEditing
                ? 'Update Reading'
                : 'Add Reading'}
            </span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="rounded-full border border-[#48a992]/30 bg-white px-5 py-3 text-sm font-semibold text-[#4e6b64] shadow-sm transition-all hover:bg-[#e3f1eb] hover:text-[#267464] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
