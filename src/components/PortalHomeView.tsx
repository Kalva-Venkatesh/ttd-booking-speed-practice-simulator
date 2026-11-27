import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck,
  Clock,
  Flame,
  Keyboard,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import {
  BookingCategoryId,
  DifficultyLevel,
  PracticeAttempt,
  SimulatorSettings,
} from '../types/simulator';
import {
  BANNER_IMAGE_URL,
  CATEGORY_LIST,
  COTTAGES_IMAGE_URL,
  DIFFICULTY_PRESETS,
  TEMPLE_CORRIDOR_IMAGE_URL,
  formatDuration,
} from '../data/mockProfiles';

interface PortalHomeViewProps {
  settings: SimulatorSettings;
  bestTimeSeconds: number | null;
  attempts: PracticeAttempt[];
  onSelectCategoryFree: (categoryId: BookingCategoryId) => void;
  onStartQuickSpeed: (
    difficulty: Exclude<DifficultyLevel, 'custom'>,
    categoryId?: BookingCategoryId
  ) => void;
  onOpenSpeedHub: () => void;
  onOpenDashboard: () => void;
}

const CATEGORY_ICONS: Record<BookingCategoryId, React.ReactNode> = {
  angapradakshinam: <Flame className="w-5 h-5 text-[#E86A17]" aria-hidden="true" />,
  darshan_300: <CalendarCheck className="w-5 h-5 text-[#0B3D91]" aria-hidden="true" />,
  srivari_seva: <Users className="w-5 h-5 text-[#0B3D91]" aria-hidden="true" />,
  accommodation: <Building2 className="w-5 h-5 text-[#E86A17]" aria-hidden="true" />,
};

export const PortalHomeView: React.FC<PortalHomeViewProps> = ({
  settings,
  bestTimeSeconds,
  attempts,
  onSelectCategoryFree,
  onStartQuickSpeed,
  onOpenSpeedHub,
  onOpenDashboard,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [corridorImgFailed, setCorridorImgFailed] = useState(false);
  const [cottageImgFailed, setCottageImgFailed] = useState(false);

  const totalAttempts = attempts.length;
  const successCount = attempts.filter((a) => a.outcome === 'success').length;
  const successRate =
    totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-10 pb-12">
      {/* Temple-Themed Hero Section */}
      <section className="relative overflow-hidden bg-[#072A66] border-b border-slate-200">
        {!heroImgFailed ? (
          <img
            src={BANNER_IMAGE_URL}
            alt="Golden hour South Indian temple gopuram rising over misty Tirumala-inspired hills"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#072A66] via-[#0B3D91] to-[#8C3B0B]" />
        )}
        {/* Measured contrast scrim (>= 4.5:1 text legibility) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061D47]/95 via-[#072A66]/82 to-[#072A66]/45" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-orange-300 mb-3">
              Tirumala Online Seva &amp; Darshan Quota Speed Trainer · Offline Simulation
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight text-balance">
              Master TTD Ticket Booking Speed Before Quota Opens
            </h1>
            <p className="mt-4 text-base text-blue-100 leading-relaxed max-w-xl">
              Train on a realistic 5-step Darshan, Seva, and Accommodation booking flow with live depleting slot inventories and millisecond-accurate timing.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onOpenSpeedHub}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Timer className="w-4 h-4" aria-hidden="true" />
                Start Speed Practice
              </button>
              <button
                type="button"
                onClick={() => onSelectCategoryFree('darshan_300')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-white/12 hover:bg-white/20 border border-white/30 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Free Practice Flow
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Full-width 4-Column Practice Snapshot Strip */}
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/15">
            <div>
              <p className="text-xs text-blue-200">Next Simulated Quota Release</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                {settings.openingTimeLabel}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Your Personal Best</p>
              <p className="mt-1 font-mono text-lg font-semibold text-orange-300 tabular-nums">
                {bestTimeSeconds !== null ? formatDuration(bestTimeSeconds) : 'No record yet'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Practice Attempts Logged</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                {totalAttempts} {totalAttempts === 1 ? 'run' : 'runs'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-200">Completion Success Rate</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white tabular-nums">
                {totalAttempts > 0 ? `${successRate}%` : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section 1: 4 Booking Categories */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Simulated Pilgrim Booking Services
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select any booking category below to practice the full 5-step booking journey with live simulated availability.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B3D91] hover:text-[#072A66] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              View Performance Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORY_LIST.map((cat) => {
              const limitCfg = settings.categoryLimits[cat.id];
              return (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-[#0B3D91]/50 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          {CATEGORY_ICONS[cat.id]}
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-slate-900">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                            {cat.tariffLabel} · Max {limitCfg.maxTicketsPerBooking}{' '}
                            {cat.id === 'accommodation' ? 'rooms' : 'tickets'} ·{' '}
                            {limitCfg.initialInventoryPerSlot}/slot
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3.5 text-sm text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>
                    <p className="mt-2.5 text-xs text-slate-500">
                      Reporting: {cat.reportingLocation}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectCategoryFree(cat.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0B3D91] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Practice Booking
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartQuickSpeed('hard', cat.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E86A17] hover:text-[#C8560D] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                      60s Speed Drill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Speed Practice Difficulty Levels */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Speed Practice Difficulty Tiers
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a timed sprint to measure your booking speed, handle depleting quotas, and record personal bests locally.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenSpeedHub}
              className="text-sm font-semibold text-[#E86A17] hover:text-[#C8560D] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Custom Timer &amp; Scenarios →
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['easy', 'medium', 'hard'] as const).map((level) => {
              const preset = DIFFICULTY_PRESETS[level];
              return (
                <div
                  key={level}
                  className="p-5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {preset.label}
                      </h3>
                      <span className="font-mono text-sm font-bold text-[#0B3D91] tabular-nums">
                        {preset.timeDisplay}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartQuickSpeed(level)}
                    className={`mt-5 w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      level === 'hard'
                        ? 'bg-[#E86A17] hover:bg-[#C8560D] text-white'
                        : 'bg-[#0B3D91] hover:bg-[#072A66] text-white'
                    }`}
                  >
                    Start {preset.label} Drill
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Visual Temple Heritage & Speed Tips Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Built for Real-World Quota Readiness
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Real TTD online quota releases—especially Angapradakshinam and ₹300 Special Entry Darshan—often fill out within 60 to 120 seconds. Practicing your navigation flow and keyboard ergonomics helps eliminate hesitation.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <Keyboard className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Keyboard-First Speed</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Press Enter to jump inputs automatically, Alt+Q to quick-fill fictional devotees, and Alt+N to advance steps.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#E86A17] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Live Quota Simulation</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Experience virtual queue countdowns, live draining ticket counters, and configurable high-traffic edge cases.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">100% Private &amp; Offline</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      No registration, no real payment gateway, and zero connection to official TTD servers. All stats stay in your browser.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Personal Best Tracking</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Track completion times, success ratios, and category trends in the built-in performance dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 min-h-[220px]">
              {!corridorImgFailed ? (
                <img
                  src={TEMPLE_CORRIDOR_IMAGE_URL}
                  alt="Traditional South Indian temple corridor illuminated by brass deepam lamps and marigold garlands"
                  referrerPolicy="no-referrer"
                  onError={() => setCorridorImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-amber-800 to-slate-900 flex items-center justify-center p-4">
                  <Sparkles className="w-8 h-8 text-amber-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                <p className="text-xs font-semibold text-white">
                  Darshan &amp; Seva Quota Drills
                </p>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 min-h-[220px]">
              {!cottageImgFailed ? (
                <img
                  src={COTTAGES_IMAGE_URL}
                  alt="Peaceful misty hills with traditional South Indian pilgrim guest house cottages at sunrise"
                  referrerPolicy="no-referrer"
                  onError={() => setCottageImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-blue-900 to-slate-900 flex items-center justify-center p-4">
                  <Building2 className="w-8 h-8 text-blue-200" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                <p className="text-xs font-semibold text-white">
                  Tirumala &amp; Tirupati Stay Quotas
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
