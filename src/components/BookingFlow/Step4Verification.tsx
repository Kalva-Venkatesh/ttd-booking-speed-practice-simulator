import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RefreshCw,
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
  enableOtpChallenge: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirmSubmit: () => void;
}

const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCaptchaCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

function generateSixDigitOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const Step4Verification: React.FC<Step4VerificationProps> = ({
  categoryId,
  subOption,
  dateKey,
  slotLabel,
  devotees,
  totalAmount,
  enableOtpChallenge,
  isSubmitting,
  onBack,
  onConfirmSubmit,
}) => {
  const category = BOOKING_CATEGORIES[categoryId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captchaInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const [captchaCode, setCaptchaCode] = useState<string>(() => generateCaptchaCode(6));
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Simulated OTP state
  const [otpRequested, setOtpRequested] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Mandatory checkbox
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState('');

  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(0, 0, w, h);

    // Subtle noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = i % 2 === 0 ? '#CBD5E1' : '#93C5FD';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // Characters with slight rotation & spacing
    const step = (w - 24) / code.length;
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = 18 + i * step;
      const y = h / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() - 0.5) * 0.32;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = '700 24px "JetBrains Mono", monospace';
      ctx.fillStyle = i % 2 === 0 ? '#0B3D91' : '#1E293B';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Light speckles
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
  }, []);

  useEffect(() => {
    drawCaptcha(captchaCode);
  }, [captchaCode, drawCaptcha]);

  useEffect(() => {
    captchaInputRef.current?.focus();
  }, []);

  const handleRefreshCaptcha = () => {
    const next = generateCaptchaCode(6);
    setCaptchaCode(next);
    setCaptchaInput('');
    setCaptchaError('');
    captchaInputRef.current?.focus();
  };

  const handleSendOtp = () => {
    const otp = generateSixDigitOtp();
    setGeneratedOtp(otp);
    setOtpRequested(true);
    setOtpVerified(false);
    setOtpInput('');
    setOtpError('');
    setTimeout(() => otpInputRef.current?.focus(), 30);
  };

  const handleOtpInputChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setOtpInput(digits);
    setOtpError('');
    if (digits.length === 6 && generatedOtp) {
      if (digits === generatedOtp) {
        setOtpVerified(true);
      } else {
        setOtpVerified(false);
        setOtpError('Incorrect simulated OTP. Check the SMS preview code above.');
      }
    } else {
      setOtpVerified(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    let valid = true;

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError('CAPTCHA code does not match. Please enter the 6 characters shown.');
      captchaInputRef.current?.focus();
      valid = false;
    } else {
      setCaptchaError('');
    }

    if (enableOtpChallenge) {
      if (!otpRequested || !generatedOtp) {
        setOtpError('Click "Send Simulated OTP" and enter the 6-digit code.');
        valid = false;
      } else if (otpInput !== generatedOtp) {
        setOtpError('Enter the matching 6-digit simulated OTP.');
        if (valid) otpInputRef.current?.focus();
        valid = false;
      } else {
        setOtpError('');
        setOtpVerified(true);
      }
    }

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
          4. Verification &amp; Final Review
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Complete the simulated CAPTCHA {enableOtpChallenge ? 'and OTP verification ' : ''}to lock your practice quota.
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

      {/* Verification Grid: CAPTCHA + Optional Simulated OTP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAPTCHA Box */}
        <div className="border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Security CAPTCHA Challenge <span className="text-red-600">*</span>
            </h3>
            <button
              type="button"
              onClick={handleRefreshCaptcha}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3D91] hover:text-[#072A66] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-3">
            <canvas
              ref={canvasRef}
              width={200}
              height={54}
              aria-label="Simulated CAPTCHA image"
              className="rounded-md border border-slate-300 bg-slate-100 shrink-0"
            />
            <span className="text-[11px] text-slate-500 leading-snug">
              Case-insensitive 6-character code. Press Refresh if unclear.
            </span>
          </div>

          <div>
            <label
              htmlFor="captcha-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Enter CAPTCHA Code
            </label>
            <input
              ref={captchaInputRef}
              id="captcha-input"
              type="text"
              autoComplete="off"
              maxLength={6}
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value.toUpperCase());
                setCaptchaError('');
              }}
              aria-invalid={Boolean(captchaError)}
              placeholder="Type 6-character code"
              className={`w-full px-3 py-2 text-sm font-mono tracking-widest uppercase rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                captchaError
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-slate-300 focus:border-[#0B3D91]'
              }`}
            />
            {captchaError && (
              <p className="mt-1.5 text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {captchaError}
              </p>
            )}
          </div>
        </div>

        {/* Simulated OTP Verification Box */}
        <div className="border border-slate-200 rounded-lg p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Simulated Mobile OTP{' '}
              {enableOtpChallenge ? (
                <span className="text-red-600">*</span>
              ) : (
                <span className="text-xs font-normal text-slate-500">(Optional)</span>
              )}
            </h3>
            <button
              type="button"
              onClick={handleSendOtp}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0B3D91] hover:bg-[#072A66] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {otpRequested ? 'Resend OTP' : 'Send Simulated OTP'}
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Target Mobile:{' '}
            <span className="font-mono font-semibold text-slate-900">
              +91 {devotees[0]?.mobile || '9000000000'}
            </span>{' '}
            (Offline simulation — no real SMS sent)
          </p>

          {otpRequested && generatedOtp && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950">
                <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                <span>
                  Simulated SMS: Your practice OTP is{' '}
                  <strong className="font-mono text-sm tracking-wider text-[#0B3D91]">
                    {generatedOtp}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOtpInputChange(generatedOtp)}
                className="text-[11px] font-semibold text-[#0B3D91] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          <div>
            <label
              htmlFor="otp-input"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Enter 6-Digit OTP
            </label>
            <div className="relative">
              <input
                ref={otpInputRef}
                id="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                disabled={!otpRequested}
                value={otpInput}
                onChange={(e) => handleOtpInputChange(e.target.value)}
                aria-invalid={Boolean(otpError)}
                placeholder={
                  otpRequested ? 'Enter 6-digit OTP' : 'Click "Send Simulated OTP" first'
                }
                className={`w-full px-3 py-2 text-sm font-mono tracking-widest rounded-lg border bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/25 ${
                  otpError
                    ? 'border-red-500 focus:border-red-600'
                    : otpVerified
                      ? 'border-emerald-600'
                      : 'border-slate-300 focus:border-[#0B3D91]'
                }`}
              />
              {otpVerified && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
            {otpError && (
              <p className="mt-1.5 text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {otpError}
              </p>
            )}
          </div>
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
