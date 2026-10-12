import React from 'react';
import { useBrandGuard } from '../../context/BrandGuardContext';
import { Shield, Loader2, CheckCircle2 } from 'lucide-react';

export const ScanModal: React.FC = () => {
  const { isScanning, scanProgress, scanPhase } = useBrandGuard();

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-100">
              Running Brand Impersonation Scan
            </h3>
            <p className="text-xs text-neutral-400">
              Digital Risk Protection Engine v1.0
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400">Pipeline Execution</span>
            <span className="text-indigo-400 font-semibold tabular-nums">{scanProgress}%</span>
          </div>
          <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>

        {/* Current phase log */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 mb-5 font-mono text-xs text-neutral-300 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
          <span className="truncate">{scanPhase}</span>
        </div>

        {/* Exclusion guarantee callout */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300/90 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-emerald-300">Official Exclusion Active:</strong> All 7 verified Nike social accounts & apps are registered in whitelist and will never trigger false alerts.
          </span>
        </div>
      </div>
    </div>
  );
};
