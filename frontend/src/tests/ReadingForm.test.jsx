import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReadingForm from '../components/ReadingForm';
import { apiRequest } from '../api';

// Mock the API client
vi.mock('../api', () => ({
  apiRequest: vi.fn(),
}));

describe('ReadingForm Component', () => {
  const mockOnReadingAdded = vi.fn();
  const mockOnReadingUpdated = vi.fn();
  const mockOnCancelEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all required form fields and submit button', () => {
    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    expect(screen.getByText(/Log Glucose Reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Meal Slot/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Glucose Value/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Add Reading/i })
    ).toBeInTheDocument();
  });

  it('shows validation error when glucose value is empty', async () => {
    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    const submitBtn = screen.getByRole('button', { name: /Add Reading/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Please enter a glucose value/i)
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('shows validation error when glucose value is below 40', async () => {
    const user = userEvent.setup();
    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    const valueInput = screen.getByPlaceholderText(/e\.g\. 110/i);
    await user.type(valueInput, '35');

    const submitBtn = screen.getByRole('button', { name: /Add Reading/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Value must be between 40 and 600 mg\/dl/i)
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('shows validation error when glucose value is above 600', async () => {
    const user = userEvent.setup();
    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    const valueInput = screen.getByPlaceholderText(/e\.g\. 110/i);
    await user.type(valueInput, '650');

    const submitBtn = screen.getByRole('button', { name: /Add Reading/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Value must be between 40 and 600 mg\/dl/i)
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('shows error when date is in the future', async () => {
    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    const dateInput = screen.getByLabelText(/Date/i);
    const valueInput = screen.getByPlaceholderText(/e\.g\. 110/i);

    fireEvent.change(dateInput, { target: { value: '2099-12-31' } });
    fireEvent.change(valueInput, { target: { value: '110' } });

    const submitBtn = screen.getByRole('button', { name: /Add Reading/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Date cannot be in the future/i)
    ).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('marks already-logged slots as disabled for the selected date', () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const existing = [
      { id: 1, date: todayStr, slot: 'morning', value: 95 },
      { id: 2, date: todayStr, slot: 'after_lunch', value: 130 },
    ];

    render(
      <ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={existing} />
    );

    const morningOption = screen.getByRole('option', {
      name: /Morning \(fasting\) ✓ \(already recorded\)/i,
    });
    expect(morningOption).toBeDisabled();

    const lunchOption = screen.getByRole('option', {
      name: /After lunch ✓ \(already recorded\)/i,
    });
    expect(lunchOption).toBeDisabled();

    const breakfastOption = screen.getByRole('option', {
      name: /After breakfast/i,
    });
    expect(breakfastOption).not.toBeDisabled();
  });

  it('disables submission when all 4 daily slots are filled', () => {
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const fourReadings = [
      { id: 1, date: todayStr, slot: 'morning', value: 90 },
      { id: 2, date: todayStr, slot: 'after_breakfast', value: 115 },
      { id: 3, date: todayStr, slot: 'after_lunch', value: 130 },
      { id: 4, date: todayStr, slot: 'after_dinner', value: 120 },
    ];

    render(
      <ReadingForm
        onReadingAdded={mockOnReadingAdded}
        allReadings={fourReadings}
      />
    );

    expect(
      screen.getByText(/All 4 meal slots are already recorded for this date/i)
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', {
      name: /All 4 Slots Logged for This Date/i,
    });
    expect(submitBtn).toBeDisabled();
  });

  it('successfully submits valid reading with POST /readings', async () => {
    const user = userEvent.setup();
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    apiRequest.mockResolvedValueOnce({
      reading: { id: 10, date: todayStr, slot: 'morning', value: 105 },
    });

    render(<ReadingForm onReadingAdded={mockOnReadingAdded} allReadings={[]} />);

    const valueInput = screen.getByPlaceholderText(/e\.g\. 110/i);
    await user.type(valueInput, '105');

    const submitBtn = screen.getByRole('button', { name: /Add Reading/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/readings', {
        method: 'POST',
        body: { date: todayStr, slot: 'morning', value: 105 },
      });
      expect(mockOnReadingAdded).toHaveBeenCalled();
    });

    expect(
      await screen.findByText(/Reading of 105 mg\/dL recorded successfully/i)
    ).toBeInTheDocument();
  });

  it('switches to Edit Mode, pre-fills data, and updates with PUT /readings/:id', async () => {
    const user = userEvent.setup();
    const editingItem = {
      id: 42,
      date: '2026-11-18',
      slot: 'after_lunch',
      slotLabel: 'After lunch',
      value: 145,
    };

    apiRequest.mockResolvedValueOnce({
      reading: { id: 42, date: '2026-11-18', slot: 'after_lunch', value: 135 },
    });

    render(
      <ReadingForm
        editingReading={editingItem}
        onReadingUpdated={mockOnReadingUpdated}
        onCancelEdit={mockOnCancelEdit}
        allReadings={[editingItem]}
      />
    );

    expect(screen.getByText(/Edit Glucose Reading/i)).toBeInTheDocument();
    expect(screen.getByText(/Edit Mode/i)).toBeInTheDocument();

    const valueInput = screen.getByPlaceholderText(/e\.g\. 110/i);
    expect(valueInput).toHaveValue(145);

    // Update value to 135
    await user.clear(valueInput);
    await user.type(valueInput, '135');

    const updateBtn = screen.getByRole('button', { name: /Update Reading/i });
    await user.click(updateBtn);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/readings/42', {
        method: 'PUT',
        body: { date: '2026-11-18', slot: 'after_lunch', value: 135 },
      });
      expect(mockOnReadingUpdated).toHaveBeenCalled();
    });
  });

  it('cancels edit mode when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const editingItem = {
      id: 42,
      date: '2026-11-18',
      slot: 'after_lunch',
      value: 145,
    };

    render(
      <ReadingForm
        editingReading={editingItem}
        onCancelEdit={mockOnCancelEdit}
        allReadings={[editingItem]}
      />
    );

    const cancelButtons = screen.getAllByRole('button', { name: /Cancel/i });
    await user.click(cancelButtons[0]);

    expect(mockOnCancelEdit).toHaveBeenCalled();
  });
});
