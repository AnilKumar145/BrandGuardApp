import React from 'react';
import { RiskLevel } from '../../types';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    high: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      indicator: 'bg-rose-500',
      label: 'High Risk',
      icon: ShieldAlert,
    },
    medium: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      indicator: 'bg-amber-500',
      label: 'Medium Risk',
      icon: AlertTriangle,
    },
    low: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      indicator: 'bg-emerald-500',
      label: 'Low Risk',
      icon: CheckCircle2,
    },
  };

  const current = configs[level];
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-sans whitespace-nowrap shrink-0 transition-colors ${current.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-90 ml-0.5">
          ({score})
        </span>
      )}
    </span>
  );
};
