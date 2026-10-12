import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrandGuard } from '../context/BrandGuardContext';
import { RiskLevel, SourceType, DetectionStatus, Platform } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Inbox,
} from 'lucide-react';

export const DetectionsListPage: React.FC = () => {
  const { detections } = useBrandGuard();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DetectionStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'riskScore' | 'detectedAt'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered & sorted detections
  const filteredDetections = useMemo(() => {
    return detections
      .filter((d) => {
        // Search term matching
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = d.title.toLowerCase().includes(term);
          const matchHandle = d.handleOrPackage.toLowerCase().includes(term);
          const matchDev = d.developerOrOwner.toLowerCase().includes(term);
          const matchDesc = d.description.toLowerCase().includes(term);
          if (!matchTitle && !matchHandle && !matchDev && !matchDesc) return false;
        }

        // Risk level filter
        if (riskFilter !== 'all' && d.riskLevel !== riskFilter) return false;

        // Source filter
        if (sourceFilter !== 'all' && d.sourceType !== sourceFilter) return false;

        // Status filter
        if (statusFilter !== 'all' && d.status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'riskScore') {
          return sortOrder === 'desc'
            ? b.riskScore - a.riskScore
            : a.riskScore - b.riskScore;
        } else {
          const timeA = new Date(a.detectedAt).getTime();
          const timeB = new Date(b.detectedAt).getTime();
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        }
      });
  }, [detections, searchTerm, riskFilter, sourceFilter, statusFilter, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setSourceFilter('all');
    setStatusFilter('all');
    setSortBy('riskScore');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    riskFilter !== 'all' ||
    sourceFilter !== 'all' ||
    statusFilter !== 'all';

  const formatDetectedTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Impersonation Detections
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Prioritized threats discovered via social feeds, Play Store, and App Store indices.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span>Displaying</span>
          <strong className="text-indigo-400 tabular-nums font-semibold">
            {filteredDetections.length}
          </strong>
          <span>of</span>
          <span className="text-neutral-200 tabular-nums">{detections.length} candidates</span>
        </div>
      </div>

      {/* Control Bar: Search & Filter Chips */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, @handle, package ID, or publisher..."
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="sm:col-span-2">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'all')}
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Risk: All Levels</option>
              <option value="high">High Risk (&ge; 80)</option>
              <option value="medium">Medium Risk (50-79)</option>
              <option value="low">Low Risk (&lt; 50)</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="sm:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as SourceType | 'all')}
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Source: All Types</option>
              <option value="social">Social Media</option>
              <option value="app_store">Mobile App Store</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DetectionStatus | 'all')}
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Status: All Statuses</option>
              <option value="needs_review">Needs Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="false_positive">False Positive</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="sm:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="p-2 text-neutral-400 hover:text-neutral-100 rounded-lg hover:bg-neutral-800 transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detections Data Table */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
        {filteredDetections.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500 mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">No detections matched your filters</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Try adjusting your search criteria, selecting a different risk category, or resetting all filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 px-3.5 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141724] border-b border-neutral-800 text-neutral-400 font-medium select-none">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'riskScore') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('riskScore');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Risk Score</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Suspect Title / Entity</th>
                  <th className="py-3 px-4">Platform</th>
                  <th className="py-3 px-4">Source Category</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-neutral-200 transition-colors"
                    onClick={() => {
                      if (sortBy === 'detectedAt') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('detectedAt');
                        setSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Detected Date</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredDetections.map((det) => (
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
                        <div className="w-9 h-9 max-w-[36px] max-h-[36px] rounded-lg bg-neutral-800 border border-neutral-700/80 overflow-hidden shrink-0">
                          <img
                            src={det.logoUrl}
                            alt={det.title}
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <p className="font-semibold text-neutral-100 group-hover:text-indigo-300 transition-colors truncate">
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

                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                      {formatDetectedTime(det.detectedAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-400 group-hover:translate-x-1 transition-transform">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
