import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Keyboard,
  Play,
  Shuffle,
  SlidersHorizontal,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  AvailabilityScenario,
  BookingCategoryId,
  DifficultyLevel,
  PracticeAttempt,
  SimulatorSettings,
} from '../types/simulator';
import {
  CATEGORY_LIST,
  DIFFICULTY_PRESETS,
  formatDuration,
} from '../data/mockProfiles';

interface SpeedPracticeHubProps {
  settings: SimulatorSettings;
  attempts: PracticeAttempt[];
  bestTimeSeconds: number | null;
  onUpdateSettings: (partial: Partial<SimulatorSettings>) => void;
  onStartPractice: (config: {
    categoryId: BookingCategoryId | 'random';
    difficulty: DifficultyLevel;
    customSeconds: number;
    scenario: AvailabilityScenario;
    useOpeningCountdown: boolean;
  }) => void;
  onOpenSettings: () => void;
}

const SCENARIO_OPTIONS: {
  id: AvailabilityScenario;
  label: string;
  desc: string;
}[] = [
  { id: 'normal', label: 'Normal Quota', desc: 'Plentiful dates & steady ticket counts.' },
  { id: 'high_rush', label: 'High Rush', desc: 'Half of dates sold out; fast-filling slots.' },
  { id: 'scarce_flash', label: 'Scarce Flash', desc: 'Only a few open dates with rapid depletion.' },
  { id: 'random', label: 'Random Scenario', desc: 'Unpredictable availability every run.' },
];

export const SpeedPracticeHub: React.FC<SpeedPracticeHubProps> = ({
  settings,
  attempts,
  bestTimeSeconds,
  onUpdateSettings,
  onStartPractice,
  onOpenSettings,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    settings.difficulty
  );
  const [customSeconds, setCustomSeconds] = useState<number>(settings.customTimeSeconds);
  const [selectedCategory, setSelectedCategory] = useState<BookingCategoryId | 'random'>(
    'darshan_300'
  );
  const [selectedScenario, setSelectedScenario] = useState<AvailabilityScenario>(
    settings.availabilityScenario
  );
  const [useOpeningCountdown, setUseOpeningCountdown] = useState<boolean>(
    settings.autoStartAtOpening
  );

  const recentAttempts = attempts.slice(0, 5);

  const handleLaunch = () => {
    onUpdateSettings({
      difficulty: selectedDifficulty,
      customTimeSeconds: customSeconds,
      availabilityScenario: selectedScenario,
      autoStartAtOpening: useOpeningCountdown,
    });
    onStartPractice({
      categoryId: selectedCategory,
      difficulty: selectedDifficulty,
      customSeconds,
      scenario: selectedScenario,
      useOpeningCountdown,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Booking Speed Practice Mode
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Configure your countdown timer, quota scarcity scenario, and target category to simulate high-pressure TTD ticket releases.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          Inventory &amp; Failure Rules
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Practice Configuration Deck */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 space-y-7">
          {/* 1. Difficulty Selection */}
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 mb-3">
              1. Choose Difficulty &amp; Countdown Timer
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => {
                const preset = DIFFICULTY_PRESETS[level];
                const active = selectedDifficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(level);
                      setSelectedScenario(preset.recommendedScenario);
                    }}
                    className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-blue-50/80 border-[#0B3D91] ring-1 ring-[#0B3D91]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p
                      className={`font-display text-sm font-bold ${
                        active ? 'text-[#0B3D91]' : 'text-slate-900'
                      }`}
                    >
                      {preset.label}
                    </p>
                    <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                      {preset.timeDisplay}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {level === 'easy'
                        ? 'Relaxed training'
                        : level === 'medium'
                          ? 'Standard rush'
                          : 'Flash quota sprint'}
                    </p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedDifficulty('custom')}
                className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedDifficulty === 'custom'
                    ? 'bg-blue-50/80 border-[#0B3D91] ring-1 ring-[#0B3D91]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p
                  className={`font-display text-sm font-bold ${
                    selectedDifficulty === 'custom' ? 'text-[#0B3D91]' : 'text-slate-900'
                  }`}
                >
                  Custom
                </p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {customSeconds}s
                </p>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Set exact target
                </p>
              </button>
            </div>

            {selectedDifficulty === 'custom' && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                  <label htmlFor="custom-timer-range">Custom Countdown Limit</label>
                  <span className="font-mono text-sm text-[#0B3D91] tabular-nums">
                    {customSeconds} seconds ({formatDuration(customSeconds)})
                  </span>
                </div>
                <input
                  id="custom-timer-range"
                  type="range"
                  min={25}
                  max={600}
                  step={5}
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Number(e.target.value))}
                  className="w-full accent-[#0B3D91]"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                  <span>25s</span>
                  <span>60s</span>
                  <span>180s</span>
                  <span>600s</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Category Selection */}
          <div className="pt-6 border-t border-slate-200">
            <h2 className="font-display text-base font-bold text-slate-900 mb-3">
              2. Target Booking Category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORY_LIST.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold">{cat.shortName}</p>
                    <p
                      className={`text-[11px] font-mono mt-0.5 ${
                        active ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {cat.tariffLabel}
                    </p>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setSelectedCategory('random')}
                className={`px-4 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedCategory === 'random'
                    ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold inline-flex items-center gap-1.5">
                  <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                  Random Category
                </p>
                <p
                  className={`text-[11px] mt-0.5 ${
                    selectedCategory === 'random' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  Surprise drill
                </p>
              </button>
            </div>
          </div>

          {/* 3. Availability Scenario & Opening Mode */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 mb-3">
                3. Ticket Availability Scenario
              </h2>
              <div className="space-y-2">
                {SCENARIO_OPTIONS.map((sc) => {
                  const active = selectedScenario === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setSelectedScenario(sc.id)}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-orange-50 border-[#E86A17]'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{sc.label}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{sc.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-base font-bold text-slate-900 mb-3">
                4. Opening Simulation Mode
              </h2>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setUseOpeningCountdown(true)}
                  className={`w-full px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    useOpeningCountdown
                      ? 'bg-blue-50/80 border-[#0B3D91]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">
                    Automatic Quota Opening Countdown ({settings.openingDelaySeconds}s)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Simulates waiting for {settings.openingTimeLabel} &amp; virtual queue entry before starting the clock.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUseOpeningCountdown(false)}
                  className={`w-full px-3.5 py-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    !useOpeningCountdown
                      ? 'bg-blue-50/80 border-[#0B3D91]'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">
                    Manual Instant Start (No Waiting Room)
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Launches straight into Step 1 and begins the booking stopwatch immediately.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Primary Launch Button */}
          <div className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Live ticket depletion:{' '}
              <strong className="text-slate-900 capitalize">
                {settings.ticketDrainSpeed}
              </strong>{' '}
              · OTP verification:{' '}
              <strong className="text-slate-900">
                {settings.enableOtpChallenge ? 'Enabled' : 'Disabled'}
              </strong>
            </div>
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              Start Practice Session
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Personal Best, Recent Attempts & Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Best Time Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Trophy className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
              Personal Best Booking Time
            </div>
            <p className="mt-2 font-mono text-3xl font-bold text-[#0B3D91] tabular-nums">
              {bestTimeSeconds !== null ? formatDuration(bestTimeSeconds) : '—'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {bestTimeSeconds !== null
                ? 'Stored locally in your browser. Beat your record on Hard (60s)!'
                : 'Complete a booking to set your first personal best record.'}
            </p>
          </div>

          {/* Recent Practice Attempts */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-display text-sm font-bold text-slate-900 mb-3">
              Previous Practice Attempts
            </h3>
            {recentAttempts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No previous attempts yet. Start your first timed run to build history.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentAttempts.map((att) => (
                  <li
                    key={att.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {att.categoryName}
                      </p>
                      <p className="text-[11px] text-slate-500 capitalize">
                        {att.difficulty} · {new Date(att.timestamp).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-slate-900 tabular-nums">
                        {att.timeUsedSeconds.toFixed(1)}s
                      </p>
                      <p
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          att.outcome === 'success' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {att.outcome === 'success' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                            Success
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" aria-hidden="true" />
                            {att.outcome === 'timeout' ? 'Timeout' : 'Failed'}
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-[#0B3D91]" aria-hidden="true" />
              <h3 className="font-display text-sm font-bold text-slate-900">
                Speed Keyboard Shortcuts
              </h3>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Quick-fill fictional devotees</dt>
                <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Alt + Q
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Advance to next step</dt>
                <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Alt + N
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Restart practice timer</dt>
                <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Alt + R
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Select ticket count (Step 2)</dt>
                <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Keys 1–6
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-600">Jump to next input (Step 3)</dt>
                <dd className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Enter
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
