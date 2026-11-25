import React, { useState } from 'react';
import { CheckCircle2, RefreshCw, RotateCcw } from 'lucide-react';
import {
  AvailabilityScenario,
  BookingCategoryId,
  SimulatorSettings,
  TicketDrainSpeed,
} from '../types/simulator';
import { CATEGORY_LIST, DEFAULT_SETTINGS } from '../data/mockProfiles';

interface SettingsViewProps {
  settings: SimulatorSettings;
  onUpdateSettings: (next: SimulatorSettings) => void;
  onRegenerateInventory: (settingsOverride?: SimulatorSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onRegenerateInventory,
}) => {
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2600);
  };

  const updateField = <K extends keyof SimulatorSettings>(
    key: K,
    value: SimulatorSettings[K]
  ) => {
    const next = { ...settings, [key]: value };
    onUpdateSettings(next);
  };

  const updateCategoryLimit = (
    catId: BookingCategoryId,
    field: 'maxTicketsPerBooking' | 'initialInventoryPerSlot',
    value: number
  ) => {
    const clamped =
      field === 'maxTicketsPerBooking'
        ? Math.max(1, Math.min(10, value))
        : Math.max(4, Math.min(200, value));
    const next: SimulatorSettings = {
      ...settings,
      categoryLimits: {
        ...settings.categoryLimits,
        [catId]: {
          ...settings.categoryLimits[catId],
          [field]: clamped,
        },
      },
    };
    onUpdateSettings(next);
  };

  const handleApplyAndRegenerate = () => {
    onRegenerateInventory(settings);
    showToast('Simulated ticket inventory refreshed with your updated configuration.');
  };

  const handleRestoreDefaults = () => {
    onUpdateSettings(DEFAULT_SETTINGS);
    onRegenerateInventory(DEFAULT_SETTINGS);
    showToast('Default simulator settings and ticket inventory restored.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Simulator Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Customize ticket limits, slot inventory capacities, fictional booking opening times, and rush failure behavior.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleApplyAndRegenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0B3D91] hover:bg-[#072A66] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Refresh Ticket Inventory
          </button>
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Restore Defaults
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          {savedNotice}
        </div>
      )}

      {/* Section 1: Category Ticket Limits & Slot Inventory */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Category Ticket Limits &amp; Simulated Slot Inventory
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure realistic booking caps (e.g., Angapradakshinam max 2 tickets, ₹300 SED max 6 tickets) and starting tickets per time slot.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-4 font-semibold">Booking Category</th>
                <th className="py-3 px-4 font-semibold">Max Tickets / Booking</th>
                <th className="py-3 px-4 font-semibold">Initial Quota / Slot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {CATEGORY_LIST.map((cat) => {
                const cfg = settings.categoryLimits[cat.id];
                return (
                  <tr key={cat.id}>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{cat.name}</p>
                      <p className="text-[11px] text-slate-500">{cat.tariffLabel}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          aria-label={`${cat.name} maximum tickets per booking`}
                          value={cfg.maxTicketsPerBooking}
                          onChange={(e) =>
                            updateCategoryLimit(
                              cat.id,
                              'maxTicketsPerBooking',
                              Number(e.target.value)
                            )
                          }
                          className="w-20 px-2.5 py-1.5 font-mono text-sm tabular-nums border border-slate-300 rounded-md focus:outline-none focus:border-[#0B3D91]"
                        />
                        <span className="text-slate-500">
                          {cat.id === 'accommodation' ? 'rooms (1–10)' : 'tickets (1–10)'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={4}
                          max={200}
                          aria-label={`${cat.name} initial quota per slot`}
                          value={cfg.initialInventoryPerSlot}
                          onChange={(e) =>
                            updateCategoryLimit(
                              cat.id,
                              'initialInventoryPerSlot',
                              Number(e.target.value)
                            )
                          }
                          className="w-24 px-2.5 py-1.5 font-mono text-sm tabular-nums border border-slate-300 rounded-md focus:outline-none focus:border-[#0B3D91]"
                        />
                        <span className="text-slate-500">per slot (4–200)</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 2: Booking Opening & Queue Simulation */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Booking Opening Time &amp; Virtual Queue Behavior
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Control the fictional quota release clock, countdown delay, and simulated virtual waiting room duration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label
              htmlFor="opening-time-label"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Fictional Booking Opening Time Label
            </label>
            <input
              id="opening-time-label"
              type="text"
              value={settings.openingTimeLabel}
              onChange={(e) => updateField('openingTimeLabel', e.target.value)}
              placeholder="10:00:00 AM IST"
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B3D91]"
            />
          </div>

          <div>
            <label
              htmlFor="opening-delay"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Pre-Opening Countdown ({settings.openingDelaySeconds}s)
            </label>
            <input
              id="opening-delay"
              type="range"
              min={3}
              max={20}
              value={settings.openingDelaySeconds}
              onChange={(e) => updateField('openingDelaySeconds', Number(e.target.value))}
              className="w-full accent-[#0B3D91] mt-2"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>3s</span>
              <span>10s</span>
              <span>20s</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="queue-wait"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Virtual Queue Loading Wait ({settings.simulatedQueueWaitSeconds}s)
            </label>
            <input
              id="queue-wait"
              type="range"
              min={0}
              max={6}
              value={settings.simulatedQueueWaitSeconds}
              onChange={(e) =>
                updateField('simulatedQueueWaitSeconds', Number(e.target.value))
              }
              className="w-full accent-[#0B3D91] mt-2"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>0s (Instant)</span>
              <span>3s</span>
              <span>6s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Scarcity, Ticket Drain & Random Failures */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Realism &amp; Pressure Controls
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Fine-tune how quickly tickets deplete during practice, random failure rates, and OTP challenge enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="default-scenario"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Default Availability Scenario
            </label>
            <select
              id="default-scenario"
              value={settings.availabilityScenario}
              onChange={(e) =>
                updateField(
                  'availabilityScenario',
                  e.target.value as AvailabilityScenario
                )
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0B3D91]"
            >
              <option value="normal">Normal Quota (Balanced)</option>
              <option value="high_rush">High Rush (Realistic Monthly Release)</option>
              <option value="scarce_flash">Scarce Flash (Extreme Scarcity)</option>
              <option value="random">Random Scenario Each Session</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="drain-speed"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Live Ticket Depletion Speed (During Practice)
            </label>
            <select
              id="drain-speed"
              value={settings.ticketDrainSpeed}
              onChange={(e) =>
                updateField('ticketDrainSpeed', e.target.value as TicketDrainSpeed)
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0B3D91]"
            >
              <option value="off">Off (Static Inventory Until Booking)</option>
              <option value="moderate">Moderate (Realistic Gradual Drain)</option>
              <option value="aggressive">Aggressive (Rapid Flash Quota Drain)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <label htmlFor="failure-rate">
                Simulated High-Traffic Failure Probability
              </label>
              <span className="font-mono text-sm text-[#0B3D91] tabular-nums">
                {settings.randomFailureRate}%
              </span>
            </div>
            <input
              id="failure-rate"
              type="range"
              min={0}
              max={35}
              step={1}
              value={settings.randomFailureRate}
              onChange={(e) => updateField('randomFailureRate', Number(e.target.value))}
              className="w-full accent-[#E86A17]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Set to 0% for guaranteed confirmation on valid forms, or 8–20% to simulate realistic last-second quota exhaustion.
            </p>
          </div>

          <div className="flex flex-col justify-center space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableOtpChallenge}
                onChange={(e) => updateField('enableOtpChallenge', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0B3D91] focus:ring-[#0B3D91]"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  Require Simulated 6-Digit OTP Verification (Step 4)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Displays an on-screen simulated SMS OTP to train copy/typing speed under pressure.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoStartAtOpening}
                onChange={(e) => updateField('autoStartAtOpening', e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0B3D91] focus:ring-[#0B3D91]"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900">
                  Auto-Start After Fictional Opening Countdown
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shows the quota release waiting room before starting Speed Practice sessions.
                </p>
              </div>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
