import React from 'react';
import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import {
  AttemptOutcome,
  ConfirmedBooking,
} from '../../types/simulator';
import { formatDuration } from '../../data/mockProfiles';

interface FailedSessionInfo {
  outcome: Exclude<AttemptOutcome, 'success'>;
  reason: string;
  timeUsedSeconds: number;
  timeLimitSeconds?: number;
  categoryName: string;
  stepReached: number;
}

interface Step5ConfirmationProps {
  confirmedBooking: ConfirmedBooking | null;
  failedInfo: FailedSessionInfo | null;
  bestTimeSeconds: number | null;
  onRestartPractice: () => void;
  onNewFreeBooking: () => void;
  onViewDashboard: () => void;
}

/** Deterministic geometric SVG QR visual representing the fictional reference string */
const FictionalQrSvg: React.FC<{ value: string }> = ({ value }) => {
  const size = 9;
  const cells: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      const isCorner =
        (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3);
      if (isCorner) {
        const inInner =
          (r === 1 && c === 1) ||
          (r === 1 && c === size - 2) ||
          (r === size - 2 && c === 1);
        const onBorder =
          r === 0 ||
          r === 2 ||
          c === 0 ||
          c === 2 ||
          r === size - 1 ||
          r === size - 3 ||
          c === size - 1 ||
          c === size - 3;
        row.push(inInner || onBorder);
      } else {
        const bit = ((hash >>> ((r * size + c) % 24)) ^ (r * 7 + c * 13)) & 1;
        row.push(bit === 1);
      }
    }
    cells.push(row);
  }

  return (
    <svg
      width="84"
      height="84"
      viewBox={`0 0 ${size * 10} ${size * 10}`}
      role="img"
      aria-label={`Simulated reference code pattern for ${value}`}
      className="border border-slate-200 rounded bg-white p-1"
    >
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * 10}
              y={r * 10}
              width={9}
              height={9}
              fill="#0F172A"
              rx={1}
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const Step5Confirmation: React.FC<Step5ConfirmationProps> = ({
  confirmedBooking,
  failedInfo,
  bestTimeSeconds,
  onRestartPractice,
  onNewFreeBooking,
  onViewDashboard,
}) => {
  // FAILED ATTEMPT VIEW
  if (failedInfo && !confirmedBooking) {
    const headingMap: Record<Exclude<AttemptOutcome, 'success'>, string> = {
      timeout: 'Practice Countdown Expired',
      quota_exhausted: 'Simulated Quota Exhausted During Checkout',
      server_busy: 'Simulated High-Traffic Session Timeout',
    };

    return (
      <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-700 text-white px-6 py-5 flex items-center gap-3">
          <AlertOctagon className="w-7 h-7 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl font-bold">
              {headingMap[failedInfo.outcome]}
            </h2>
            <p className="text-xs text-red-100 mt-0.5">
              Attempt logged to your local practice history · Analyze &amp; try again faster
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-slate-700 leading-relaxed">{failedInfo.reason}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div>
              <p className="text-xs text-slate-500">Category</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {failedInfo.categoryName}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Time Elapsed</p>
              <p className="font-mono text-lg font-bold text-red-700 tabular-nums mt-0.5">
                {formatDuration(failedInfo.timeUsedSeconds)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Step Reached</p>
              <p className="font-mono text-sm font-semibold text-slate-900 mt-0.5">
                Step {failedInfo.stepReached} of 5
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRestartPractice}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Restart Practice
            </button>
            <button
              type="button"
              onClick={onViewDashboard}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B3D91] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              View Dashboard
            </button>
            <button
              type="button"
              onClick={onNewFreeBooking}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Try Free Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!confirmedBooking) return null;

  const formattedDate = (() => {
    const [y, m, d] = confirmedBooking.dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <div className="space-y-6">
      {/* Performance Result Banner (hidden in print) */}
      <div className="no-print bg-emerald-50 border border-emerald-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-xl font-bold text-emerald-950">
                Simulated Booking Confirmed!
              </h2>
              {confirmedBooking.isNewPersonalBest && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309]">
                  <Trophy className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                  New Personal Best!
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-emerald-900">
              <span className="inline-flex items-center gap-1 font-mono font-bold tabular-nums">
                <Clock className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                Completed in {confirmedBooking.timeUsedSeconds.toFixed(1)}s
              </span>
              {confirmedBooking.timeLimitSeconds && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-xs">
                    Limit: {confirmedBooking.timeLimitSeconds}s
                  </span>
                </>
              )}
              {bestTimeSeconds !== null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-xs">
                    Best Record: {formatDuration(bestTimeSeconds)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRestartPractice}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Restart Practice
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[#0B3D91] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Print Receipt
          </button>
          <button
            type="button"
            onClick={onViewDashboard}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Printable Fictional Confirmation Receipt */}
      <article className="print-receipt bg-white border border-slate-300 rounded-xl overflow-hidden">
        {/* Practice Simulator Header Banner */}
        <div className="bg-[#0B3D91] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-orange-300">
              TTD Booking Speed Practice Simulator · Offline Training Receipt
            </p>
            <h3 className="font-display text-lg font-bold mt-0.5">
              Fictional E-Darshan / Seva Acknowledgement
            </h3>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[11px] text-blue-200">Fictional Booking Reference</p>
            <p className="font-mono text-base font-bold text-white tracking-wide tabular-nums">
              {confirmedBooking.bookingRef}
            </p>
          </div>
        </div>

        {/* Unmistakable Non-Official Notice */}
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-2 text-xs font-semibold text-[#9A3412]">
          PRACTICE RECEIPT ONLY — NOT ISSUED BY TTD AND NOT VALID FOR REAL TEMPLE ENTRY OR ACCOMMODATION.
        </div>

        <div className="p-6 space-y-6">
          {/* Top Details + Simulated QR */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 flex-1 text-sm">
              <div>
                <p className="text-xs text-slate-500">Booking Category</p>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {confirmedBooking.categoryName}
                </p>
                {confirmedBooking.subOption && (
                  <p className="text-xs text-slate-600 mt-0.5">{confirmedBooking.subOption}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500">Darshan / Seva Date</p>
                <p className="font-semibold text-slate-900 mt-0.5">{formattedDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reporting Time Slot</p>
                <p className="font-semibold text-[#0B3D91] mt-0.5">
                  {confirmedBooking.slotLabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Simulated Tariff &amp; Tickets</p>
                <p className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                  {confirmedBooking.ticketCount}{' '}
                  {confirmedBooking.categoryId === 'accommodation' ? 'Room(s)' : 'Ticket(s)'} ·{' '}
                  {confirmedBooking.totalAmount === 0
                    ? 'Free'
                    : `₹${confirmedBooking.totalAmount.toLocaleString('en-IN')}`}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Simulated Reporting Location</p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">
                  {confirmedBooking.reportingLocation}
                </p>
              </div>
            </div>

            <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0">
              <FictionalQrSvg value={confirmedBooking.bookingRef} />
              <span className="font-mono text-[10px] text-slate-500">
                SIMULATED QR
              </span>
            </div>
          </div>

          {/* Devotee Details Table */}
          <div>
            <h4 className="font-display text-sm font-bold text-slate-900 mb-3">
              Pilgrim Details ({confirmedBooking.devotees.length})
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3 font-semibold">#</th>
                    <th className="py-2.5 px-3 font-semibold">Full Name</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Age</th>
                    <th className="py-2.5 px-3 font-semibold">Gender</th>
                    <th className="py-2.5 px-3 font-semibold">ID Proof</th>
                    <th className="py-2.5 px-3 font-semibold">Mobile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {confirmedBooking.devotees.map((dev, idx) => (
                    <tr key={dev.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {dev.fullName}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right text-slate-700">
                        {dev.age}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{dev.gender}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {dev.idProofType} · {dev.idProofNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {dev.mobile}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Receipt Footer Metadata */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Generated: {new Date(confirmedBooking.bookedAt).toLocaleString('en-IN')} · Mode:{' '}
              {confirmedBooking.mode === 'speed_practice'
                ? 'Speed Practice'
                : 'Free Practice'}
            </span>
            <span className="font-mono tabular-nums">
              Completion Time: {confirmedBooking.timeUsedSeconds.toFixed(1)}s
            </span>
          </div>
        </div>
      </article>

      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={onNewFreeBooking}
          className="text-sm font-semibold text-[#0B3D91] hover:text-[#072A66] cursor-pointer"
        >
          Start Another Practice Booking →
        </button>
      </div>
    </div>
  );
};
