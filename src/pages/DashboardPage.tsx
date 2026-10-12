import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrandGuard } from '../context/BrandGuardContext';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';
import { PlatformBreakdownChart } from '../components/charts/PlatformBreakdownChart';
import {
  ShieldAlert,
  Clock,
  Radar,
  ArrowRight,
  Play,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { summary, detections, brand, runNewScan, isScanning } = useBrandGuard();
  const navigate = useNavigate();

  // Top 5 High or Pending Detections
  const recentDetections = [...detections]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const formatLastScan = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Threat Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Monitoring impersonation threats and look-alikes across social networks and app stores for <strong className="text-neutral-200">{brand.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runNewScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isScanning ? 'Scanning Indices...' : 'Run New Scan'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Detections */}
        <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Total Detections</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {summary.totalDetections}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="text-indigo-400 font-semibold">{summary.bySource.social} social</span>
            <span>·</span>
            <span className="text-purple-400 font-semibold">{summary.bySource.appStore} app store</span>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-[#0f111a] border border-rose-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-300">High Risk Threats</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-rose-400 tabular-nums">
              {summary.highRisk}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400/80 flex items-center gap-1.5">
            <span>Score $\ge 80$</span>
            <span>·</span>
            <span>Immediate takedown priority</span>
          </div>
        </div>

        {/* Needs Review */}
        <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Needs Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {summary.needsReview}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="text-emerald-400">{summary.reviewed} reviewed</span>
            <span>·</span>
            <span>{summary.escalated} escalated</span>
          </div>
        </div>

        {/* Last Scan Time */}
        <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Last Engine Scan</span>
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
              <Radar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm sm:text-base font-semibold font-mono text-neutral-100 tabular-nums">
              {formatLastScan(summary.lastScanAt)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Official assets 100% excluded</span>
          </div>
        </div>
      </div>

      {/* Two Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-5 bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Risk Level Distribution</h3>
              <p className="text-xs text-neutral-400">Calculated via multi-signal scoring model</p>
            </div>
            <span className="text-xs font-mono text-neutral-500">0 - 100 pts</span>
          </div>
          <div className="flex-1 py-2">
            <RiskDistributionChart summary={summary} />
          </div>
        </div>

        {/* Platform Breakdown Chart */}
        <div className="lg:col-span-7 bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Platform Breakdown</h3>
              <p className="text-xs text-neutral-400">Coverage across Social Media & App Stores</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              6 Active Feeds
            </span>
          </div>
          <div className="flex-1 py-2">
            <PlatformBreakdownChart summary={summary} />
          </div>
        </div>
      </div>

      {/* Priority Threat Queue (Top 5 Detections) */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Priority Threat Queue (Top Detections)</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ranked descending by composite risk score. Click any row for in-depth signal breakdown.
            </p>
          </div>
          <button
            onClick={() => navigate('/detections')}
            className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View all ({summary.totalDetections})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141724] border-b border-neutral-800 text-neutral-400 font-medium">
              <tr>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Detected Entity / Name</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-sans">
              {recentDetections.map((det) => (
                <tr
                  key={det.id}
                  onClick={() => navigate(`/detections/${det.id}`)}
                  className="hover:bg-neutral-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <RiskBadge level={det.riskLevel} score={det.riskScore} />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 max-w-[32px] max-h-[32px] rounded-lg bg-neutral-800 border border-neutral-700/80 overflow-hidden shrink-0">
                        <img
                          src={det.logoUrl}
                          alt={det.title}
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-medium text-neutral-100 group-hover:text-indigo-300 transition-colors truncate">
                          {det.title}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          {det.handleOrPackage}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <PlatformBadge platform={det.platform} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[11px] font-mono uppercase text-neutral-400">
                      {det.sourceType === 'social' ? 'Social Media' : 'App Store'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={det.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
