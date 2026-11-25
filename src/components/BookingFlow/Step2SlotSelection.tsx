import React, { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Minus,
  Plus,
  Ticket,
} from 'lucide-react';
import {
  BookingCategoryId,
  DayInventory,
  SimulatorSettings,
} from '../../types/simulator';
import { BOOKING_CATEGORIES } from '../../data/mockProfiles';

interface Step2SlotSelectionProps {
  categoryId: BookingCategoryId;
  subOption: string;
  dayInventory: DayInventory;
  selectedSlotId: string | null;
  ticketCount: number;
  settings: SimulatorSettings;
  onSelectSlot: (slotId: string) => void;
  onChangeTicketCount: (count: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2SlotSelection: React.FC<Step2SlotSelectionProps> = ({
  categoryId,
  subOption,
  dayInventory,
  selectedSlotId,
  ticketCount,
  settings,
  onSelectSlot,
  onChangeTicketCount,
  onBack,
  onNext,
}) => {
  const category = BOOKING_CATEGORIES[categoryId];
  const limitConfig = settings.categoryLimits[categoryId];

  const selectedSlot =
    dayInventory.slots.find((s) => s.slotId === selectedSlotId) || null;

  const maxAllowed = selectedSlot
    ? Math.min(limitConfig.maxTicketsPerBooking, selectedSlot.remainingTickets)
    : limitConfig.maxTicketsPerBooking;

  const isAccommodation = categoryId === 'accommodation';
  const unitLabel = isAccommodation ? 'Room' : 'Ticket';

  // Calculate simulated unit tariff (accounts for AC cottage option or extra laddus)
  let unitPrice = category.pricePerTicket;
  if (categoryId === 'accommodation' && subOption.includes('₹1000')) {
    unitPrice = 1000;
  }
  let extraCharges = 0;
  if (categoryId === 'darshan_300' && subOption.includes('+₹100')) {
    extraCharges = 100;
  } else if (categoryId === 'darshan_300' && subOption.includes('+₹200')) {
    extraCharges = 200;
  }
  const totalAmount = unitPrice * ticketCount + extraCharges;

  // Clamp ticket count if live ticket drain reduces remaining below current selection
  useEffect(() => {
    if (selectedSlot && selectedSlot.remainingTickets > 0 && ticketCount > selectedSlot.remainingTickets) {
      onChangeTicketCount(selectedSlot.remainingTickets);
    }
  }, [selectedSlot, ticketCount, onChangeTicketCount]);

  // Fast keyboard number shortcuts (1-6) for ticket count when not typing in an input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }
      const num = Number(e.key);
      if (num >= 1 && num <= maxAllowed && selectedSlot && selectedSlot.remainingTickets > 0) {
        onChangeTicketCount(num);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [maxAllowed, selectedSlot, onChangeTicketCount]);

  const formattedDate = (() => {
    const [y, m, d] = dayInventory.dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  const canProceed =
    selectedSlot !== null &&
    selectedSlot.remainingTickets >= ticketCount &&
    ticketCount >= 1;

  return (
    <div className="space-y-6">
      {/* Slots Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              2. Select Time Slot &amp; Number of {unitLabel}s
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {category.name} · {formattedDate}
              {subOption ? ` · ${subOption}` : ''}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Max {limitConfig.maxTicketsPerBooking} {unitLabel.toLowerCase()}s per booking
          </span>
        </div>

        {/* Live Depletion Notice if selected slot sold out */}
        {selectedSlot && selectedSlot.remainingTickets === 0 && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Slot Exhausted!</strong> The selected slot ({selectedSlot.timeLabel}) ran out of simulated quota while you were viewing. Choose another open slot below immediately.
            </p>
          </div>
        )}

        {/* Time Slots Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dayInventory.slots.map((slot) => {
            const isSoldOut = slot.remainingTickets <= 0;
            const isSelected = selectedSlotId === slot.slotId && !isSoldOut;
            const isFastFilling = slot.status === 'fast_filling';

            return (
              <button
                key={slot.slotId}
                type="button"
                disabled={isSoldOut}
                onClick={() => onSelectSlot(slot.slotId)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isSoldOut
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : isSelected
                      ? 'bg-blue-50/80 border-[#0B3D91] ring-1 ring-[#0B3D91] cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-[#0B3D91]/60 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                      isSoldOut
                        ? 'text-slate-400 line-through'
                        : isSelected
                          ? 'text-[#0B3D91]'
                          : 'text-slate-900'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {slot.timeLabel}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between gap-2 text-xs">
                  <span
                    className={`font-semibold ${
                      isSoldOut
                        ? 'text-red-700'
                        : isFastFilling
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                    }`}
                  >
                    {isSoldOut
                      ? 'Quota Full'
                      : isFastFilling
                        ? 'Fast Filling'
                        : 'Available'}
                  </span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {slot.remainingTickets} / {slot.totalTickets} left
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Ticket Quantity & Tariff Panel */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-sm font-semibold text-slate-900">
              Number of {unitLabel}s
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Select 1 to {Math.max(1, maxAllowed)} {unitLabel.toLowerCase()}s (or press keys 1–{Math.max(1, maxAllowed)}).
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={ticketCount <= 1}
                onClick={() => onChangeTicketCount(Math.max(1, ticketCount - 1))}
                aria-label={`Decrease ${unitLabel.toLowerCase()} count`}
                className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-4 h-4 text-slate-700" />
              </button>

              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {Array.from({ length: limitConfig.maxTicketsPerBooking }, (_, i) => i + 1).map(
                  (num) => {
                    const unavailable = selectedSlot ? num > selectedSlot.remainingTickets : false;
                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={unavailable}
                        onClick={() => onChangeTicketCount(num)}
                        className={`w-9 h-8 rounded-md font-mono text-sm font-bold tabular-nums transition-colors ${
                          unavailable
                            ? 'text-slate-300 cursor-not-allowed'
                            : ticketCount === num
                              ? 'bg-[#0B3D91] text-white cursor-pointer'
                              : 'text-slate-700 hover:bg-white cursor-pointer'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                disabled={ticketCount >= maxAllowed}
                onClick={() => onChangeTicketCount(Math.min(maxAllowed, ticketCount + 1))}
                aria-label={`Increase ${unitLabel.toLowerCase()} count`}
                className="w-10 h-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Tariff Breakdown */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#0B3D91]" aria-hidden="true" />
                {unitPrice > 0 ? `₹${unitPrice} × ${ticketCount} ${unitLabel.toLowerCase()}(s)` : 'Free Simulated Quota'}
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                ₹{unitPrice * ticketCount}
              </span>
            </div>
            {extraCharges > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-600">
                <span>Additional Laddu Preference</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  ₹{extraCharges}
                </span>
              </div>
            )}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Total Simulated Tariff (No Real Payment)
              </span>
              <span className="font-mono text-lg font-bold text-[#0B3D91] tabular-nums">
                {totalAmount === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Change Date
          </button>

          <button
            type="button"
            disabled={!canProceed}
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Enter Devotee Details
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
