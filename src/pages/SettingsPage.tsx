import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import {
  Sliders,
  Bell,
  Shield,
  Key,
  Database,
  RotateCcw,
  CheckCircle2,
  Save,
  Radio,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast, resetAllData } = useBrandGuard();

  const [scanCadence, setScanCadence] = useState<'hourly' | 'daily' | 'continuous'>('hourly');
  const [highRiskThreshold, setHighRiskThreshold] = useState(80);
  const [publisherMismatchPenalty, setPublisherMismatchPenalty] = useState(25);
  const [slackWebhook, setSlackWebhook] = useState('https://hooks.slack.com/services/T00/B00/XXXX');
  const [autoEscalate, setAutoEscalate] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Settings Saved',
      description: 'Engine detection parameters and notification channels updated.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          System & Engine Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Configure detection sensitivity parameters, crawler scheduling, and escalation integrations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Detection Engine Parameters */}
        <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Detection Sensitivity & Scoring Calibration</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  High Risk Threshold
                </label>
                <span className="font-mono text-xs text-rose-400 font-semibold tabular-nums">
                  Score &ge; {highRiskThreshold}
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                value={highRiskThreshold}
                onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Candidates meeting or exceeding this score appear with red priority status.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-neutral-300">
                  Publisher Mismatch Penalty
                </label>
                <span className="font-mono text-xs text-amber-400 font-semibold tabular-nums">
                  +{publisherMismatchPenalty} pts
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                value={publisherMismatchPenalty}
                onChange={(e) => setPublisherMismatchPenalty(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Penalty added when third-party developers publish apps bearing official brand names.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-300 mb-2">
              Scheduled Crawler Cadence
            </label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { id: 'continuous', label: 'Continuous Stream', desc: 'Real-time WebSocket' },
                { id: 'hourly', label: 'Hourly Polling', desc: 'Every 60 minutes' },
                { id: 'daily', label: 'Daily Batch', desc: 'Every 24 hours' },
              ].map((cadence) => (
                <button
                  type="button"
                  key={cadence.id}
                  onClick={() => setScanCadence(cadence.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scanCadence === cadence.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-white'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <p className="font-semibold text-xs text-neutral-100">{cadence.label}</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{cadence.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications & Takedown Integrations */}
        <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400" />
            <span>Alerts & Escalation Webhooks</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Security Operations Slack Webhook
            </label>
            <input
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="autoEscalate"
              checked={autoEscalate}
              onChange={(e) => setAutoEscalate(e.target.checked)}
              className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoEscalate" className="text-xs text-neutral-300 cursor-pointer">
              Automatically draft DMCA / App Store takedown notices for detections with score &ge; 90
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Demo Reset Card */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-400" />
            <span>Reset Evaluation Prototype Data</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Restores the initial Nike brand profile and 14 mock detections across social networks and app stores.
          </p>
        </div>
        <button
          onClick={resetAllData}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Clean Demo State</span>
        </button>
      </div>
    </div>
  );
};
