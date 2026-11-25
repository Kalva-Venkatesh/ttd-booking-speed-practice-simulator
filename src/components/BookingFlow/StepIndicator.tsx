import React from 'react';
import { Check } from 'lucide-react';
import { BookingStep } from '../../types/simulator';

interface StepIndicatorProps {
  currentStep: BookingStep;
  maxReachedStep: BookingStep;
  isLocked: boolean;
  onStepClick: (step: BookingStep) => void;
}

const STEPS: { num: BookingStep; label: string; shortLabel: string }[] = [
  { num: 1, label: 'Category & Date', shortLabel: 'Date' },
  { num: 2, label: 'Slot & Tickets', shortLabel: 'Slot' },
  { num: 3, label: 'Devotee Details', shortLabel: 'Devotees' },
  { num: 4, label: 'Verification', shortLabel: 'Verify' },
  { num: 5, label: 'Confirmation', shortLabel: 'Confirm' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  maxReachedStep,
  isLocked,
  onStepClick,
}) => {
  return (
    <nav
      aria-label="Booking progress"
      className="no-print bg-white border border-slate-200 rounded-xl px-4 py-3.5 sm:px-6"
    >
      <ol className="flex items-center justify-between gap-2">
        {STEPS.map((step, index) => {
          const isCurrent = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const canJump =
            !isLocked &&
            step.num < 5 &&
            step.num <= maxReachedStep &&
            step.num !== currentStep;

          return (
            <React.Fragment key={step.num}>
              <li className="flex items-center min-w-0">
                <button
                  type="button"
                  disabled={!canJump}
                  onClick={() => canJump && onStepClick(step.num)}
                  className={`flex items-center gap-2.5 text-left rounded-md transition-colors ${
                    canJump ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-emerald-700 text-white'
                        : isCurrent
                          ? 'bg-[#0B3D91] text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" aria-hidden="true" /> : step.num}
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap truncate">
                    <span
                      className={
                        isCurrent
                          ? 'text-[#0B3D91]'
                          : isCompleted
                            ? 'text-slate-900'
                            : 'text-slate-500'
                      }
                    >
                      {step.label}
                    </span>
                  </span>
                  <span
                    className={`sm:hidden text-[11px] font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-[#0B3D91]' : 'text-slate-500'
                    }`}
                  >
                    {step.shortLabel}
                  </span>
                </button>
              </li>

              {index < STEPS.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`flex-1 h-0.5 min-w-[12px] rounded-full ${
                    step.num < currentStep ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
