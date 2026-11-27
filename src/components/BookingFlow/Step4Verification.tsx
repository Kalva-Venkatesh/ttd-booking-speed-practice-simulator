import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { BookingCategoryId, Devotee } from '../../types/simulator';
import { BOOKING_CATEGORIES } from '../../data/mockProfiles';

interface Step4VerificationProps {
  categoryId: BookingCategoryId;
  subOption: string;
  dateKey: string;
  slotLabel: string;
  devotees: Devotee[];
  totalAmount: number;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirmSubmit: () => void;
}

export const Step4Verification: React.FC<Step4VerificationProps> = ({
  categoryId,
  subOption,
  dateKey,
  slotLabel,
  devotees,
  totalAmount,
  isSubmitting,
  onBack,
  onConfirmSubmit,
}) => {
  const category = BOOKING_CATEGORIES[categoryId];

  // Mandatory checkbox
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    let valid = true;

    if (!agreed) {
      setAgreedError('Please confirm the booking declaration checkbox to proceed.');
      valid = false;
    } else {
      setAgreedError('');
    }

    if (valid) {
      onConfirmSubmit();
    }
  };

  const formattedDate = (() => {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6"
    >
      <div className="pb-4 border-b border-slate-200">
        <h2 className="font-display text-lg font-bold text-slate-900">
          4. Final Review
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Review your booking details and confirm the practice declaration.
        </p>
      </div>

      {/* Compact Pre-Submission Review */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs">
        <div>
          <p className="text-slate-500">Category</p>
          <p className="font-semibold text-slate-900 mt-0.5">{category.shortName}</p>
          {subOption && <p className="text-slate-600 truncate mt-0.5">{subOption}</p>}
        </div>
        <div>
          <p className="text-slate-500">Selected Date &amp; Slot</p>
          <p className="font-semibold text-slate-900 mt-0.5">{formattedDate}</p>
          <p className="text-slate-600 mt-0.5">{slotLabel}</p>
        </div>
        <div>
          <p className="text-slate-500">Pilgrims</p>
          <p className="font-semibold text-slate-900 mt-0.5 font-mono tabular-nums">
            {devotees.length} {devotees.length === 1 ? 'Devotee' : 'Devotees'}
          </p>
          <p className="text-slate-600 truncate mt-0.5">{devotees[0]?.fullName}</p>
        </div>
        <div>
          <p className="text-slate-500">Simulated Tariff</p>
          <p className="font-mono text-base font-bold text-[#0B3D91] tabular-nums mt-0.5">
            {totalAmount === 0 ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
          </p>
          <p className="text-slate-500">No real charge</p>
        </div>
      </div>

      {/* Mandatory Declaration Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setAgreedError('');
            }}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0B3D91] focus:ring-[#0B3D91]"
          />
          <span className="text-xs text-slate-700 leading-relaxed">
            I confirm that all entered devotee details are fictional practice entries for this offline simulator, and I acknowledge the reporting time, dress code, and ID verification rules.
          </span>
        </label>
        {agreedError && (
          <p className="mt-1.5 text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {agreedError}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Edit Devotee Details
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] disabled:bg-orange-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Processing Simulated Quota...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Confirm Simulated Booking
            </>
          )}
        </button>
      </div>
    </form>
  );
};
