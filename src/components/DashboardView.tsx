import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CheckCircle2,
  Play,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  BookingCategoryId,
  PracticeAttempt,
} from '../types/simulator';
import { CATEGORY_LIST, formatDuration } from '../data/mockProfiles';

interface DashboardViewProps {
  attempts: PracticeAttempt[];
  bestTimeSeconds: number | null;
  onResetStats: () => void;
  onStartPractice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  attempts,
  bestTimeSeconds,
  onResetStats,
  onStartPractice,
}) => {
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | BookingCategoryId>('all');
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => {
    const total = attempts.length;
    const successful = attempts.filter((a) => a.outcome === 'success');
    const failed = attempts.filter((a) => a.outcome !== 'success');
    const avgTime =
      successful.length > 0
        ? successful.reduce((sum, a) => sum + a.timeUsedSeconds, 0) / successful.length
        : null;
    const successPct = total > 0 ? Math.round((successful.length / total) * 100) : 0;

    return {
      total,
      successCount: successful.length,
      failedCount: failed.length,
      avgTime,
      successPct,
    };
  }, [attempts]);

  // Trend chart data (chronological order of last 15 attempts)
  const trendData = useMemo(() => {
    return [...attempts]
      .slice(0, 15)
      .reverse()
      .map((a, idx) => ({
        run: `#${idx + 1}`,
        seconds: Number(a.timeUsedSeconds.toFixed(1)),
        outcome: a.outcome === 'success' ? 'Success' : 'Failed',
        category: a.categoryName,
      }));
  }, [attempts]);

  // Category breakdown chart data
  const categoryData = useMemo(() => {
    return CATEGORY_LIST.map((cat) => {
      const catAttempts = attempts.filter((a) => a.categoryId === cat.id);
      const succ = catAttempts.filter((a) => a.outcome === 'success').length;
      const fail = catAttempts.length - succ;
      return {
        name: cat.shortName,
        Success: succ,
        Failed: fail,
      };
    });
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) => {
      if (outcomeFilter === 'success' && a.outcome !== 'success') return false;
      if (outcomeFilter === 'failed' && a.outcome === 'success') return false;
      if (categoryFilter !== 'all' && a.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [attempts, outcomeFilter, categoryFilter]);

  const handleConfirmReset = () => {
    onResetStats();
    setConfirmReset(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Practice Performance Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Local booking speed metrics, completion trends, and detailed session history stored in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            New Speed Run
          </button>

          {attempts.length > 0 && !confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Statistics
            </button>
          )}

          {confirmReset && (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs">
              <span className="font-semibold text-red-800">Clear all history?</span>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-semibold rounded cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6-Metric KPI Strip (Single Elevation, Clean Dividers) */}
      <section className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Total Attempts</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Successful Bookings</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.successCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Failed Attempts</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-red-700 tabular-nums">
            {stats.failedCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Average Booking Time</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#0B3D91] tabular-nums">
            {stats.avgTime !== null ? formatDuration(stats.avgTime) : '—'}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Best Booking Time</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-[#E86A17] tabular-nums">
            {bestTimeSeconds !== null ? formatDuration(bestTimeSeconds) : '—'}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500">Success Percentage</p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {stats.total > 0 ? `${stats.successPct}%` : '—'}
          </p>
        </div>
      </section>

      {/* Empty State vs Charts + History Table */}
      {attempts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
          <RotateCcw className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
          <div className="max-w-md mx-auto">
            <h2 className="font-display text-lg font-bold text-slate-900">
              No Practice Attempts Recorded Yet
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Complete a timed or free booking simulation to see your completion speed trends, category success breakdown, and personal best timeline here.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#E86A17] hover:bg-[#C8560D] rounded-lg transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            Start Your First Practice Run
          </button>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Trend Area Chart */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Booking Completion Time Trend
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seconds elapsed across your last {trendData.length} runs (lower is faster)
                  </p>
                </div>
                {bestTimeSeconds !== null && (
                  <span className="font-mono text-xs font-semibold text-[#E86A17] tabular-nums">
                    Best: {bestTimeSeconds.toFixed(1)}s
                  </span>
                )}
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ttdTimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0B3D91" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#0B3D91" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="run"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      unit="s"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      width={44}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value}s`, 'Time Used']}
                    />
                    {bestTimeSeconds !== null && (
                      <ReferenceLine
                        y={Number(bestTimeSeconds.toFixed(1))}
                        stroke="#E86A17"
                        strokeDasharray="4 4"
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="seconds"
                      stroke="#0B3D91"
                      strokeWidth={2.2}
                      fill="url(#ttdTimeGrad)"
                      dot={{ r: 3.5, fill: '#0B3D91', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#E86A17' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Bar Chart */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Outcomes by Booking Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirmed vs failed attempts across all four TTD practice services
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="Success" fill="#15803D" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="Failed" fill="#B91C1C" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Practice History Table */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 sm:px-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Recent Practice History
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
                  Showing {filteredAttempts.length} of {attempts.length} logged attempts
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Outcome Filter Segmented Control */}
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                  {(['all', 'success', 'failed'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setOutcomeFilter(f)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors cursor-pointer ${
                        outcomeFilter === f
                          ? 'bg-white text-[#0B3D91] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Category Select Filter */}
                <select
                  aria-label="Filter history by booking category"
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value as 'all' | BookingCategoryId)
                  }
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B3D91]"
                >
                  <option value="all">All Categories</option>
                  {CATEGORY_LIST.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Mode / Difficulty</th>
                    <th className="py-3 px-4 font-semibold text-right">Time Used</th>
                    <th className="py-3 px-4 font-semibold text-right">Tickets</th>
                    <th className="py-3 px-4 font-semibold">Reference / Detail</th>
                    <th className="py-3 px-4 font-semibold">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {new Date(att.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {att.categoryName}
                      </td>
                      <td className="py-3 px-4 text-slate-700 capitalize whitespace-nowrap">
                        {att.mode === 'speed_practice'
                          ? `${att.difficulty} (${att.timeLimitSeconds}s)`
                          : 'Free Practice'}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900 tabular-nums whitespace-nowrap">
                        {att.timeUsedSeconds.toFixed(1)}s
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-700 tabular-nums">
                        {att.ticketsBooked}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {att.bookingRef || att.failureReason || `Stopped at Step ${att.stepReached}`}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {att.outcome === 'success' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-red-700">
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {att.outcome === 'timeout'
                              ? 'Time Expired'
                              : att.outcome === 'quota_exhausted'
                                ? 'Quota Full'
                                : 'Traffic Timeout'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAttempts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No attempts match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
