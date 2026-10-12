import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DashboardSummary } from '../../types';

interface RiskDistributionChartProps {
  summary: DashboardSummary;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ summary }) => {
  const data = [
    { name: 'High Risk', value: summary.highRisk, color: '#f43f5e' },
    { name: 'Medium Risk', value: summary.mediumRisk, color: '#f59e0b' },
    { name: 'Low Risk', value: summary.lowRisk, color: '#10b981' },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs shadow-xl">
                      <span className="font-medium text-neutral-200">{item.name}: </span>
                      <span className="font-mono font-semibold text-neutral-100 tabular-nums">
                        {item.value} detections
                      </span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={68}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#090a0f" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with tabular numbers */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/60 text-xs">
        {data.map((d) => (
          <div key={d.name} className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[11px] truncate">{d.name.replace(' Risk', '')}</span>
            </div>
            <span className="font-mono text-sm font-semibold text-neutral-100 tabular-nums mt-0.5">
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
