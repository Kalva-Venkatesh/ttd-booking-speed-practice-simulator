import React from 'react';
import { Clock, Loader2, Play, ShieldAlert, X } from 'lucide-react';
import { PracticePhase } from '../types/simulator';

interface WaitingRoomOverlayProps {
  phase: Extract<PracticePhase, 'scheduled_wait' | 'queue_waiting'>;
  countdownSeconds: number;
  openingTimeLabel: string;
  categoryName: string;
  queuePosition: number;
  onStartNow: () => void;
  onCancel: () => void;
}

export const WaitingRoomOverlay: React.FC<WaitingRoomOverlayProps> = ({
  phase,
  countdownSeconds,
  openingTimeLabel,
  categoryName,
  queuePosition,
  onStartNow,
  onCancel,
}) => {
  const isOpeningWait = phase === 'scheduled_wait';

  return (
    <div className="max-w-2xl mx-auto my-8 sm:my-12 px-4">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Top institutional band */}
        <div className="bg-[#0B3D91] px-6 py-4 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {isOpeningWait ? (
              <Clock className="w-5 h-5 text-orange-300 shrink-0" aria-hidden="true" />
            ) : (
              <Loader2 className="w-5 h-5 text-orange-300 animate-spin shrink-0" aria-hidden="true" />
            )}
            <h2 className="font-display text-base sm:text-lg font-semibold">
              {isOpeningWait
                ? 'Simulated Booking Quota Opening Countdown'
                : 'Virtual Waiting Queue — Connecting to Booking Portal'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel practice waiting screen"
            className="p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            {categoryName} · Fictional Release Time: {openingTimeLabel}
          </p>

          {/* Large Tabular Countdown */}
          <div className="my-6 py-6 px-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-2">
              {isOpeningWait ? 'Quota Release Opens In' : 'Estimated Virtual Queue Entry In'}
            </p>
            <div className="font-mono text-5xl sm:text-6xl font-bold text-[#0B3D91] tabular-nums tracking-tight">
              00:{String(Math.max(0, Math.ceil(countdownSeconds))).padStart(2, '0')}
            </div>
            <p className="text-xs text-slate-600 mt-3 font-mono tabular-nums">
              Simulated Queue Token #{queuePosition.toLocaleString('en-IN')} · Auto-entry armed
            </p>
          </div>

          <div className="flex items-start gap-2.5 text-left bg-orange-50 border border-orange-200/80 rounded-lg p-3.5 text-xs text-slate-700 mb-6">
            <ShieldAlert className="w-4 h-4 text-[#E86A17] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Do not refresh or close this screen during a real quota release. In this simulator, your booking stopwatch starts automatically the moment the portal opens.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onStartNow}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4" aria-hidden="true" />
              Skip Wait &amp; Start Immediately
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cancel Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
