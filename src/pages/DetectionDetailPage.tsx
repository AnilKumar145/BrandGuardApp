import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBrandGuard } from '../context/BrandGuardContext';
import { RiskBadge } from '../components/ui/RiskBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import { DetectionStatus } from '../types';
import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  CheckCheck,
  Building2,
  AlertTriangle,
  History,
  FileText,
  Save,
  Fingerprint,
  Sparkles,
} from 'lucide-react';

export const DetectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { brand, getDetection, updateDetectionStatus, updateDetectionNotes } = useBrandGuard();

  const detection = id ? getDetection(id) : undefined;
  const [noteInput, setNoteInput] = useState('');
  const [analystNotes, setAnalystNotes] = useState(detection?.notes || '');

  if (!detection) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Detection Not Found</h2>
        <p className="text-xs text-neutral-400">
          The threat record you requested does not exist or was removed.
        </p>
        <button
          onClick={() => navigate('/detections')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Return to Detections
        </button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: DetectionStatus) => {
    updateDetectionStatus(detection.id, newStatus, noteInput.trim() || undefined);
    setNoteInput('');
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetectionNotes(detection.id, analystNotes);
  };

  // Find relevant official asset for side-by-side comparison
  const relevantOfficialAsset =
    detection.sourceType === 'app_store'
      ? brand.officialApps.find((a) => a.store === detection.platform) || brand.officialApps[0]
      : brand.officialSocialAccounts.find((s) => s.platform === detection.platform) || brand.officialSocialAccounts[0];

  return (
    <div className="space-y-8">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/detections')}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Detections</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">ID: {detection.id}</span>
        </div>
      </div>

      {/* Header Banner with Big Score and Quick Actions */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Risk color background bleed */}
        <div
          className={`absolute top-0 right-0 w-80 h-40 rounded-full blur-3xl pointer-events-none ${
            detection.riskLevel === 'high'
              ? 'bg-rose-500/10'
              : detection.riskLevel === 'medium'
              ? 'bg-amber-500/10'
              : 'bg-emerald-500/10'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Suspect identity & platform */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <RiskBadge level={detection.riskLevel} size="md" />
              <StatusBadge status={detection.status} size="md" />
              <PlatformBadge platform={detection.platform} showCategory />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {detection.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-mono">
                <span className="text-indigo-400">{detection.handleOrPackage}</span>
                <span>·</span>
                <span>Detected on {new Date(detection.detectedAt).toLocaleDateString()}</span>
                {detection.url && (
                  <>
                    <span>·</span>
                    <a
                      href={detection.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Visit Live Suspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Big Score Card */}
          <div className="flex items-center gap-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shrink-0 shadow-lg">
            <div className="text-center pr-4 border-r border-neutral-800">
              <span className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Risk Score
              </span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span
                  className={`text-4xl font-extrabold font-mono tabular-nums ${
                    detection.riskLevel === 'high'
                      ? 'text-rose-400'
                      : detection.riskLevel === 'medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {detection.riskScore}
                </span>
                <span className="text-xs font-mono text-neutral-500">/100</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange('reviewed')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                    detection.status === 'reviewed'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Reviewed</span>
                </button>

                <button
                  onClick={() => handleStatusChange('false_positive')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                    detection.status === 'false_positive'
                      ? 'bg-neutral-700 text-white border-neutral-600 shadow-md'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>False Positive</span>
                </button>
              </div>

              <button
                onClick={() => handleStatusChange('escalated')}
                className={`w-full px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  detection.status === 'escalated'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
                    : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Escalate (Takedown / Legal)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Official vs Detected */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-indigo-400" />
            <span>Side-by-Side Brand Identity Comparison</span>
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            Ground Truth vs Flagged Candidate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Official Brand Ground Truth */}
          <div className="bg-[#0f111a] border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Official Brand (Verified)
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">Registered Asset</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 max-w-[64px] max-h-[64px] rounded-xl bg-white p-2 border border-neutral-700 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  style={{ maxHeight: '52px', maxWidth: '52px', objectFit: 'contain' }}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  {brand.name}
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">
                    Official
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">{brand.website}</p>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2">{brand.description}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[11px]">Primary Publisher / Dev</span>
                <span className="text-neutral-200 font-semibold">Nike, Inc.</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">
                  {detection.sourceType === 'app_store' ? 'Official Package' : 'Official Handle'}
                </span>
                <span className="text-neutral-200 font-semibold truncate block">
                  {relevantOfficialAsset
                    ? 'packageId' in relevantOfficialAsset
                      ? relevantOfficialAsset.packageId
                      : relevantOfficialAsset.handle
                    : '@Nike'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Suspect Detected Entity */}
          <div className="bg-[#0f111a] border border-rose-500/30 rounded-2xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4">
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 font-mono uppercase tracking-wide">
                <ShieldAlert className="w-3.5 h-3.5" />
                Detected Impersonator (Suspect)
              </span>
              <span className="text-[11px] text-rose-400/90 font-mono">Score {detection.riskScore}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 max-w-[64px] max-h-[64px] rounded-xl bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={detection.logoUrl}
                  alt={detection.title}
                  style={{ maxHeight: '64px', maxWidth: '64px', objectFit: 'cover' }}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-1.5 truncate">
                  {detection.title}
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded font-mono border border-rose-500/20">
                    Flagged
                  </span>
                </h3>
                <p className="text-xs font-mono text-indigo-400 truncate">
                  {detection.handleOrPackage}
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed mt-2">{detection.description}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[11px]">Developer / Owner</span>
                <span className="text-rose-300 font-semibold truncate block">
                  {detection.developerOrOwner}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Status on Feed</span>
                <span className="text-neutral-200 font-semibold">Active & Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Breakdown Section */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Multi-Signal Risk Decomposition</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Transparent algorithmic weights combining lexical distance, perceptual logo pHash, semantic bio matching, and publisher verification.
            </p>
          </div>
        </div>

        {/* Signals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Signal 1: Name Similarity */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Name Similarity</span>
              <span className="font-mono text-indigo-400 font-semibold tabular-nums">
                {detection.signals.nameSimilarity}%
              </span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${detection.signals.nameSimilarity}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              RapidFuzz Levenshtein & token ratio against brand tokens.
            </p>
          </div>

          {/* Signal 2: Logo Similarity */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Logo Similarity</span>
              <span className="font-mono text-purple-400 font-semibold tabular-nums">
                {detection.signals.logoSimilarity}%
              </span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
              <div
                className="bg-purple-500 h-full rounded-full transition-all"
                style={{ width: `${detection.signals.logoSimilarity}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Perceptual pHash Hamming distance vs trademark mark.
            </p>
          </div>

          {/* Signal 3: Description Similarity */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Bio / Text Match</span>
              <span className="font-mono text-blue-400 font-semibold tabular-nums">
                {detection.signals.descriptionSimilarity}%
              </span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${detection.signals.descriptionSimilarity}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Semantic keywords & phrase overlap with official copy.
            </p>
          </div>

          {/* Signal 4: Look-Alike Bonus */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-medium">Look-Alike Bonus</span>
              <span className="font-mono text-amber-400 font-semibold tabular-nums">
                +{detection.signals.lookalikeBonus} pts
              </span>
            </div>
            <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden border border-neutral-800">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${(detection.signals.lookalikeBonus / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 leading-tight">
              Character swaps (1 for i, 0 for o), support/help suffixes.
            </p>
          </div>
        </div>

        {/* Publisher Mismatch Alert (for Apps) */}
        {detection.signals.publisherMismatch && (
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-200">
                  Critical Publisher Mismatch Detected
                </span>
                <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                  +{detection.signals.publisherMismatch.penalty} Penalty Points
                </span>
              </div>
              <p className="text-neutral-300">
                Official Developer: <strong className="text-emerald-300">{detection.signals.publisherMismatch.expected}</strong> ·
                Detected Publisher: <strong className="text-rose-300">{detection.signals.publisherMismatch.detected}</strong>.
                Third-party entity publishing apps under protected brand marks.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Evidence & Why Flagged Section */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Forensic Evidence & Findings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {detection.evidence.map((item, idx) => (
            <div
              key={idx}
              className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="text-neutral-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Investigation Notes & Audit History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analyst Investigation Notes */}
        <div className="lg:col-span-6 bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Analyst Investigation Notes</span>
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Add internal commentary, case references, or takedown ticket numbers.
            </p>

            <form onSubmit={handleSaveNotes} className="space-y-3">
              <textarea
                rows={4}
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
                placeholder="Document your review decisions, ticket IDs (e.g. DMCA-2026-X), or contact attempts..."
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Audit History Log */}
        <div className="lg:col-span-6 bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail & Workflow History</span>
          </h2>
          <p className="text-xs text-neutral-400 mb-4">
            Immutable log of state transitions and analyst actions.
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {detection.auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-neutral-900/70 border border-neutral-800/90 rounded-xl p-3 text-xs space-y-1 font-sans"
              >
                <div className="flex items-center justify-between text-neutral-400 text-[11px] font-mono">
                  <span className="font-medium text-neutral-300">{log.author}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-neutral-200 font-medium">{log.action}</p>
                {log.note && (
                  <p className="text-[11px] text-neutral-400 italic bg-neutral-950/60 p-2 rounded-lg border border-neutral-800">
                    "{log.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
