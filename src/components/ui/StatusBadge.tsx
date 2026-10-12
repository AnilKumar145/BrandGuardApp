import React from 'react';
import { DetectionStatus } from '../../types';
import { Clock, CheckCheck, XCircle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: DetectionStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<
    DetectionStatus,
    { label: string; bg: string; icon: React.ElementType }
  > = {
    needs_review: {
      label: 'Needs Review',
      bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: Clock,
    },
    reviewed: {
      label: 'Reviewed',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: CheckCheck,
    },
    false_positive: {
      label: 'False Positive',
      bg: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
      icon: XCircle,
    },
    escalated: {
      label: 'Escalated',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: AlertOctagon,
    },
  };

  const current = configs[status] || configs.needs_review;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium whitespace-nowrap shrink-0 ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${current.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{current.label}</span>
    </span>
  );
};
