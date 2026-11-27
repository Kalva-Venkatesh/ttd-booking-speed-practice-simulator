import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  BookingCategoryId,
  Devotee,
  Gender,
  IdProofType,
} from '../../types/simulator';
import { BOOKING_CATEGORIES } from '../../data/mockProfiles';

interface Step3DevoteeDetailsProps {
  categoryId: BookingCategoryId;
  devotees: Devotee[];
  maxDevotees: number;
  onUpdateDevotee: (index: number, field: keyof Devotee, value: string) => void;
  onAddDevotee: () => void;
  onRemoveDevotee: (index: number) => void;
  onQuickFill: () => void;
  onBack: () => void;
  onNext: () => void;
}

const ID_PROOF_TYPES: IdProofType[] = [
  'Aadhaar Card',
  'Passport',
  'Voter ID',
  'PAN Card',
  'Driving License',
];

const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

export interface DevoteeFieldErrors {
  fullName?: string;
  age?: string;
  idProofNumber?: string;
  mobile?: string;
  email?: string;
}

export function validateDevotee(
  d: Devotee,
  categoryId: BookingCategoryId
): DevoteeFieldErrors {
  const errors: DevoteeFieldErrors = {};

  if (!d.fullName.trim() || d.fullName.trim().length < 2) {
    errors.fullName = 'Enter full name (min 2 characters)';
  }

  const ageNum = Number(d.age);
  if (!d.age.trim() || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Enter valid age (1–120)';
  } else if (categoryId === 'srivari_seva' && (ageNum < 18 || ageNum > 65)) {
    errors.age = 'Srivari Seva requires age 18–65';
  }

  const cleanId = d.idProofNumber.replace(/[\s-]/g, '');
  if (!cleanId) {
    errors.idProofNumber = 'Enter ID proof number';
  } else if (d.idProofType === 'Aadhaar Card' && !/^\d{12}$/.test(cleanId)) {
    errors.idProofNumber = 'Aadhaar must be exactly 12 digits';
  } else if (d.idProofType === 'PAN Card' && !/^[A-Za-z]{5}\d{4}[A-Za-z]$/.test(cleanId)) {
    errors.idProofNumber = 'Format: ABCDE1234F';
  } else if (cleanId.length < 6) {
    errors.idProofNumber = 'ID number must be at least 6 characters';
  }

  const cleanMobile = d.mobile.replace(/\D/g, '');
  if (!/^\d{10}$/.test(cleanMobile)) {
    errors.mobile = 'Enter 10-digit mobile number';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  return errors;
}

export const Step3DevoteeDetails: React.FC<Step3DevoteeDetailsProps> = ({
  categoryId,
  devotees,
  maxDevotees,
  onUpdateDevotee,
  onAddDevotee,
  onRemoveDevotee,
  onQuickFill,
  onBack,
  onNext,
}) => {
  const [errorsMap, setErrorsMap] = useState<Record<string, DevoteeFieldErrors>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const formContainerRef = useRef<HTMLFormElement>(null);
  const category = BOOKING_CATEGORIES[categoryId];

  // Auto-focus the very first input on mount for speed practice
  useEffect(() => {
    const firstInput = formContainerRef.current?.querySelector<HTMLElement>(
      'input[data-speed-field="true"]'
    );
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  const focusNextField = (currentEl: HTMLElement) => {
    if (!formContainerRef.current) return;
    const fields = Array.from(
      formContainerRef.current.querySelectorAll<HTMLElement>('[data-speed-field="true"]')
    );
    const currentIdx = fields.indexOf(currentEl);
    if (currentIdx >= 0 && currentIdx < fields.length - 1) {
      fields[currentIdx + 1].focus();
    }
  };

  const handleFieldChange = (
    index: number,
    field: keyof Devotee,
    rawValue: string,
    targetEl: HTMLElement
  ) => {
    let value = rawValue;
    if (field === 'age') {
      value = rawValue.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'mobile') {
      value = rawValue.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'idProofNumber' && devotees[index].idProofType === 'Aadhaar Card') {
      value = rawValue.replace(/\D/g, '').slice(0, 12);
    }

    onUpdateDevotee(index, field, value);

    // Re-validate inline if user already attempted submission
    if (attemptedSubmit) {
      const updated = { ...devotees[index], [field]: value };
      const errs = validateDevotee(updated, categoryId);
      setErrorsMap((prev) => ({ ...prev, [updated.id]: errs }));
    }

    // Smart Auto-Focus next field when fixed-length inputs finish
    if (field === 'age' && value.length === 2 && Number(value) >= 13) {
      focusNextField(targetEl);
    } else if (field === 'mobile' && value.length === 10) {
      focusNextField(targetEl);
    } else if (
      field === 'idProofNumber' &&
      devotees[index].idProofType === 'Aadhaar Card' &&
      value.length === 12
    ) {
      focusNextField(targetEl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, isLastField: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLastField) {
        handleSubmit();
      } else {
        focusNextField(e.currentTarget);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAttemptedSubmit(true);

    const newErrors: Record<string, DevoteeFieldErrors> = {};
    let hasError = false;

    devotees.forEach((dev) => {
      const errs = validateDevotee(dev, categoryId);
      if (Object.keys(errs).length > 0) {
        hasError = true;
        newErrors[dev.id] = errs;
      }
    });

    setErrorsMap(newErrors);

    if (!hasError) {
      onNext();
    } else {
      // Focus the first invalid input for rapid correction
      setTimeout(() => {
        const invalidEl = formContainerRef.current?.querySelector<HTMLElement>(
          '[aria-invalid="true"]'
        );
        invalidEl?.focus();
      }, 10);
    }
  };

  const handleQuickFillClick = () => {
    onQuickFill();
    setErrorsMap({});
  };

  return (
    <form
      ref={formContainerRef}
      onSubmit={handleSubmit}
      noValidate
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6"
    >
      {/* Header & Quick-Fill Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            3. Pilgrim / Devotee Details
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Enter fictional practice details. Press <kbd className="font-mono px-1 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px]">Enter</kbd> to auto-advance fields or use Quick-Fill.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleQuickFillClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B3D91] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            Quick-Fill Fictional Data (Alt+Q)
          </button>

          {devotees.length < maxDevotees && (
            <button
              type="button"
              onClick={onAddDevotee}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add Devotee ({devotees.length}/{maxDevotees})
            </button>
          )}
        </div>
      </div>

      {/* Category Advisory Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-700 flex items-start gap-2.5">
        <UserCheck className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
        <p>{category.dressCodeNote}</p>
      </div>

      {/* Devotee Rows */}
      <div className="space-y-6">
        {devotees.map((dev, index) => {
          const errs = errorsMap[dev.id] || {};
          const isLastDevotee = index === devotees.length - 1;

          return (
            <div
              key={dev.id}
              className={`pt-5 ${index > 0 ? 'border-t border-slate-200' : 'pt-0'}`}
            >
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {index === 0
                    ? 'Primary Devotee (Devotee 1)'
                    : `Devotee ${index + 1}`}
                </h3>
                {devotees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveDevotee(index)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                {/* Full Name */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor={`fullName-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`fullName-${dev.id}`}
                    type="text"
                    data-speed-field="true"
                    value={dev.fullName}
                    onChange={(e) =>
                      handleFieldChange(index, 'fullName', e.target.value, e.currentTarget)
                    }
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    aria-invalid={Boolean(errs.fullName)}
                    placeholder="e.g. Srinivasulu Reddy K"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errs.fullName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errs.fullName && (
                    <p className="mt-1 text-xs text-red-700">{errs.fullName}</p>
                  )}
                </div>

                {/* Age */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor={`age-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Age <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`age-${dev.id}`}
                    type="text"
                    inputMode="numeric"
                    data-speed-field="true"
                    value={dev.age}
                    onChange={(e) =>
                      handleFieldChange(index, 'age', e.target.value, e.currentTarget)
                    }
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    aria-invalid={Boolean(errs.age)}
                    placeholder="35"
                    className={`w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errs.age
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errs.age && <p className="mt-1 text-xs text-red-700">{errs.age}</p>}
                </div>

                {/* Gender */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor={`gender-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    id={`gender-${dev.id}`}
                    data-speed-field="true"
                    value={dev.gender}
                    onChange={(e) => {
                      onUpdateDevotee(index, 'gender', e.target.value);
                      focusNextField(e.currentTarget);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/25"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ID Proof Type */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor={`idType-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Photo ID Proof Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    id={`idType-${dev.id}`}
                    data-speed-field="true"
                    value={dev.idProofType}
                    onChange={(e) => {
                      onUpdateDevotee(index, 'idProofType', e.target.value);
                      focusNextField(e.currentTarget);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/25"
                  >
                    {ID_PROOF_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ID Proof Number */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor={`idNum-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    ID Proof Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`idNum-${dev.id}`}
                    type="text"
                    data-speed-field="true"
                    value={dev.idProofNumber}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        'idProofNumber',
                        e.target.value,
                        e.currentTarget
                      )
                    }
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    aria-invalid={Boolean(errs.idProofNumber)}
                    placeholder={
                      dev.idProofType === 'Aadhaar Card'
                        ? '12-digit fictional number'
                        : 'Fictional ID number'
                    }
                    className={`w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errs.idProofNumber
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errs.idProofNumber && (
                    <p className="mt-1 text-xs text-red-700">{errs.idProofNumber}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor={`mobile-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`mobile-${dev.id}`}
                    type="tel"
                    inputMode="numeric"
                    data-speed-field="true"
                    value={dev.mobile}
                    onChange={(e) =>
                      handleFieldChange(index, 'mobile', e.target.value, e.currentTarget)
                    }
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    aria-invalid={Boolean(errs.mobile)}
                    placeholder="10-digit mobile"
                    className={`w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errs.mobile
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errs.mobile && (
                    <p className="mt-1 text-xs text-red-700">{errs.mobile}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor={`email-${dev.id}`}
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id={`email-${dev.id}`}
                    type="email"
                    data-speed-field="true"
                    value={dev.email}
                    onChange={(e) =>
                      handleFieldChange(index, 'email', e.target.value, e.currentTarget)
                    }
                    onKeyDown={(e) => handleKeyDown(e, isLastDevotee)}
                    aria-invalid={Boolean(errs.email)}
                    placeholder="name@example.test"
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                      errs.email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-[#0B3D91]'
                    }`}
                  />
                  {errs.email && (
                    <p className="mt-1 text-xs text-red-700">{errs.email}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Slots
        </button>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Proceed to Final Review
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};
