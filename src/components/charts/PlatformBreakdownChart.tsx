import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DashboardSummary } from '../../types';

interface PlatformBreakdownChartProps {
  summary: DashboardSummary;
}

export const PlatformBreakdownChart: React.FC<PlatformBreakdownChartProps> = ({ summary }) => {
  const chartData = [
    { name: 'X', count: summary.byPlatform['x'] || 0, color: '#38bdf8' },
    { name: 'Instagram', count: summary.byPlatform['instagram'] || 0, color: '#ec4899' },
    { name: 'Facebook', count: summary.byPlatform['facebook'] || 0, color: '#3b82f6' },
    { name: 'Google Play', count: summary.byPlatform['google_play'] || 0, color: '#10b981' },
    { name: 'App Store', count: summary.byPlatform['app_store'] || 0, color: '#a855f7' },
    { name: 'TikTok', count: summary.byPlatform['tiktok'] || 0, color: '#06b6d4' },
    { name: 'YouTube', count: summary.byPlatform['youtube'] || 0, color: '#ef4444' },
  ].filter((d) => d.count > 0);

  const total = summary.totalDetections || 1;
  const socialPct = Math.round((summary.bySource.social / total) * 100);
  const appPct = Math.round((summary.bySource.appStore / total) * 100);

  return (
    <div className="flex flex-col h-full justify-between space-y-3">
      {/* Top Source Ratio Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Social Media:</span>
            <span className="font-mono font-semibold text-neutral-200 tabular-nums">
              {summary.bySource.social} ({socialPct}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">App Stores:</span>
            <span className="font-mono font-semibold text-neutral-200 tabular-nums">
              {summary.bySource.appStore} ({appPct}%)
            </span>
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-900 border border-neutral-800">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${socialPct}%` }}
          />
          <div
            className="bg-purple-500 h-full transition-all duration-300"
            style={{ width: `${appPct}%` }}
          />
        </div>
      </div>

      {/* Bar breakdown per platform */}
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="name"
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#262626' }}
            />
            <YAxis
              stroke="#737373"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs shadow-xl">
                      <span className="font-medium text-neutral-200">{item.payload.name}: </span>
                      <span className="font-mono font-semibold text-neutral-100 tabular-nums">
                        {item.value} threats detected
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
