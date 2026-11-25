import React from 'react';
import { AlertTriangle, Clock, RotateCcw, Square, Trophy } from 'lucide-react';
import { DifficultyLevel } from '../types/simulator';
import { DIFFICULTY_PRESETS, formatClock, formatDuration } from '../data/mockProfiles';

interface SpeedPracticeBannerProps {
  remainingSeconds: number;
  elapsedSeconds: number;
  timeLimitSeconds: number;
  difficulty: DifficultyLevel;
  bestTimeSeconds: number | null;
  categoryShortName: string;
  onRestart: () => void;
  onStop: () => void;
}

export const SpeedPracticeBanner: React.FC<SpeedPracticeBannerProps> = ({
  remainingSeconds,
  elapsedSeconds,
  timeLimitSeconds,
  difficulty,
  bestTimeSeconds,
  categoryShortName,
  onRestart,
  onStop,
}) => {
  const progressPct = Math.max(
    0,
    Math.min(100, (remainingSeconds / Math.max(1, timeLimitSeconds)) * 100)
  );
  const isCritical = remainingSeconds <= 15;
  const isWarning = !isCritical && remainingSeconds <= 35;

  const difficultyLabel =
    difficulty === 'custom'
      ? `Custom (${timeLimitSeconds}s)`
      : `${DIFFICULTY_PRESETS[difficulty].label} (${DIFFICULTY_PRESETS[difficulty].timeDisplay})`;

  return (
    <div
      className={`no-print border-b transition-colors ${
        isCritical
          ? 'bg-red-50 border-red-200'
          : isWarning
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Countdown Clock & Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              {isCritical ? (
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
              ) : (
                <Clock
                  className={`w-5 h-5 shrink-0 ${
                    isWarning ? 'text-amber-700' : 'text-[#0B3D91]'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span
                    className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${
                      isCritical
                        ? 'text-red-700'
                        : isWarning
                          ? 'text-amber-800'
                          : 'text-[#0B3D91]'
                    }`}
                  >
                    {formatClock(remainingSeconds)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isCritical
                        ? 'text-red-700'
                        : isWarning
                          ? 'text-amber-800'
                          : 'text-slate-600'
                    }`}
                  >
                    {isCritical
                      ? 'Critical — Final Seconds'
                      : isWarning
                        ? 'Hurry — Low Time'
                        : 'Time Remaining'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <span>{categoryShortName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{difficultyLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Used: {elapsedSeconds.toFixed(1)}s
                  </span>
                  {bestTimeSeconds !== null && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800 font-mono tabular-nums">
                        <Trophy className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                        Best: {formatDuration(bestTimeSeconds)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Session Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B3D91] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Restart (Alt+R)
            </button>
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" aria-hidden="true" />
              Exit Speed Mode
            </button>
          </div>
        </div>

        {/* Clean Progress Track */}
        <div className="mt-2.5 h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${
              isCritical
                ? 'bg-red-600'
                : isWarning
                  ? 'bg-amber-500'
                  : 'bg-[#E86A17]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
