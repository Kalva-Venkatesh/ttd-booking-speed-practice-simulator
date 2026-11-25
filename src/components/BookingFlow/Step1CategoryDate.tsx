import React, { useMemo } from 'react';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  BookingCategoryId,
  DayInventory,
  InventoryMap,
  SimulatorSettings,
} from '../../types/simulator';
import {
  BOOKING_CATEGORIES,
  CATEGORY_LIST,
  getMonthOptions,
} from '../../data/mockProfiles';

interface Step1CategoryDateProps {
  selectedCategoryId: BookingCategoryId;
  selectedSubOption: string;
  selectedMonthKey: string;
  selectedDateKey: string | null;
  inventory: InventoryMap;
  settings: SimulatorSettings;
  onSelectCategory: (catId: BookingCategoryId) => void;
  onSelectSubOption: (subOpt: string) => void;
  onSelectMonth: (monthKey: string) => void;
  onSelectDate: (dateKey: string) => void;
  onRefreshInventory: () => void;
  onNext: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Step1CategoryDate: React.FC<Step1CategoryDateProps> = ({
  selectedCategoryId,
  selectedSubOption,
  selectedMonthKey,
  selectedDateKey,
  inventory,
  settings,
  onSelectCategory,
  onSelectSubOption,
  onSelectMonth,
  onSelectDate,
  onRefreshInventory,
  onNext,
}) => {
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const activeMonth =
    monthOptions.find((m) => m.key === selectedMonthKey) || monthOptions[0];
  const category = BOOKING_CATEGORIES[selectedCategoryId];
  const limitConfig = settings.categoryLimits[selectedCategoryId];

  const invKey = `${selectedCategoryId}_${activeMonth.key}`;
  const monthDays: Record<string, DayInventory> = inventory[invKey] || {};

  const firstDayOfWeek = new Date(activeMonth.year, activeMonth.month, 1).getDay();
  const daysInMonth = new Date(activeMonth.year, activeMonth.month + 1, 0).getDate();

  const calendarCells: (DayInventory | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(
      2,
      '0'
    )}-${String(d).padStart(2, '0')}`;
    calendarCells.push(monthDays[key] || null);
  }

  const selectedDayData = selectedDateKey ? monthDays[selectedDateKey] : null;
  const availableDaysCount = Object.values(monthDays).filter(
    (d) => d.status === 'available' || d.status === 'fast_filling'
  ).length;

  const formatReadableDate = (dateKey: string) => {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              1. Select Darshan / Seva Category
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Switch categories anytime before selecting your date. Limits are configurable in Settings.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-600 tabular-nums">
            Limit: {limitConfig.maxTicketsPerBooking}{' '}
            {selectedCategoryId === 'accommodation' ? 'rooms' : 'tickets'} / booking
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORY_LIST.map((cat) => {
            const active = cat.id === selectedCategoryId;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`p-4 rounded-lg border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-50/70 border-[#0B3D91] ring-1 ring-[#0B3D91]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-display text-sm font-bold ${
                      active ? 'text-[#0B3D91]' : 'text-slate-900'
                    }`}
                  >
                    {cat.shortName}
                  </span>
                  {active && (
                    <CheckCircle2 className="w-4 h-4 text-[#0B3D91] shrink-0" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600 line-clamp-2">{cat.name}</p>
                <p className="mt-2 text-xs font-mono text-slate-500 tabular-nums">
                  {cat.tariffLabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Category-specific Sub-option */}
        {category.subOptions && category.subOptions.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {category.subOptionsLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {category.subOptions.map((opt) => {
                const isSelected = selectedSubOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSelectSubOption(opt)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Month & Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Select Quota Month &amp; Date
              </h2>
              <p className="text-xs text-slate-600 font-mono tabular-nums">
                {availableDaysCount} bookable {availableDaysCount === 1 ? 'date' : 'dates'} in{' '}
                {activeMonth.label} · Click an available date to proceed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Month Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              {monthOptions.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onSelectMonth(m.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    m.key === activeMonth.key
                      ? 'bg-white text-[#0B3D91] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onRefreshInventory}
              title="Regenerate random simulated availability"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              New Scenario
            </button>
          </div>
        </div>

        {/* Calendar Legend — Color + Explicit Text (Never Hue-Only) */}
        <div className="my-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" aria-hidden="true" />
            Available (Open)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" aria-hidden="true" />
            Fast Filling (Low Quota)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-xs bg-red-600 inline-block" aria-hidden="true" />
            Quota Full (Sold Out)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-xs bg-slate-300 inline-block" aria-hidden="true" />
            Not Released
          </span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-slate-500 py-1.5"
            >
              {day}
            </div>
          ))}

          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
            }

            const isSelected = selectedDateKey === cell.dateKey;
            const isBookable =
              cell.status === 'available' || cell.status === 'fast_filling';

            let cellStyle = '';
            let statusWord = '';

            if (cell.status === 'available') {
              statusWord = `${cell.totalRemaining} left`;
              cellStyle = isSelected
                ? 'bg-[#0B3D91] text-white border-[#0B3D91] ring-2 ring-offset-1 ring-[#0B3D91]'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 cursor-pointer';
            } else if (cell.status === 'fast_filling') {
              statusWord = `${cell.totalRemaining} fast`;
              cellStyle = isSelected
                ? 'bg-[#0B3D91] text-white border-[#0B3D91] ring-2 ring-offset-1 ring-[#0B3D91]'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 cursor-pointer';
            } else if (cell.status === 'quota_full') {
              statusWord = 'Full';
              cellStyle =
                'bg-red-50/80 text-red-700/80 border-red-200 cursor-not-allowed';
            } else {
              statusWord = 'Closed';
              cellStyle =
                'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
            }

            return (
              <button
                key={cell.dateKey}
                type="button"
                disabled={!isBookable}
                onClick={() => isBookable && onSelectDate(cell.dateKey)}
                aria-label={`${formatReadableDate(cell.dateKey)}: ${statusWord}`}
                aria-pressed={isSelected}
                className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-lg border flex flex-col items-center justify-center transition-colors ${cellStyle}`}
              >
                <span className="font-mono text-sm sm:text-base font-bold tabular-nums leading-none">
                  {cell.dayOfMonth}
                </span>
                <span
                  className={`mt-1 text-[10px] sm:text-[11px] font-medium tabular-nums truncate max-w-full ${
                    isSelected ? 'text-blue-100' : ''
                  }`}
                >
                  {statusWord}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Date Summary + Continue Action */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {selectedDayData &&
          (selectedDayData.status === 'available' ||
            selectedDayData.status === 'fast_filling') ? (
            <div className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">
                  Selected: {formatReadableDate(selectedDayData.dateKey)}
                </p>
                <p className="text-xs text-slate-600 font-mono tabular-nums mt-0.5">
                  {selectedDayData.totalRemaining} simulated{' '}
                  {selectedCategoryId === 'accommodation' ? 'rooms' : 'tickets'} remaining across{' '}
                  {selectedDayData.slots.filter((s) => s.remainingTickets > 0).length} open slots
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
              <span>Select any green (Available) or amber (Fast Filling) date to continue.</span>
            </div>
          )}

          <button
            type="button"
            disabled={
              !selectedDayData ||
              (selectedDayData.status !== 'available' &&
                selectedDayData.status !== 'fast_filling')
            }
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Continue to Time Slots
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
