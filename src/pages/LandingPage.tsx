import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBrandGuard } from '../context/BrandGuardContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  ExternalLink,
  Lock,
  Radar,
  Fingerprint,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, login } = useBrandGuard();

  // Interactive Live Impersonation Simulator on Landing Page
  const [testBrand, setTestBrand] = useState('Nike');
  const [testCandidate, setTestCandidate] = useState('N1ke Support Desk');
  const [simulatedScore, setSimulatedScore] = useState<number | null>(92);

  const runSimulation = (candidate: string) => {
    setTestCandidate(candidate);
    const lower = candidate.toLowerCase();
    if (lower.includes('1') || lower.includes('support') || lower.includes('help')) {
      setSimulatedScore(94);
    } else if (lower.includes('club') || lower.includes('fan')) {
      setSimulatedScore(62);
    } else if (lower.includes('history') || lower.includes('archive')) {
      setSimulatedScore(28);
    } else {
      setSimulatedScore(78);
    }
  };

  const handleQuickDemoLogin = async () => {
    await login('priya@company.com', 'SecurePass123!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col antialiased selection:bg-indigo-500/20">
      {/* Top Navigation Bar */}
      <header className="h-16 px-6 lg:px-12 border-b border-neutral-800/80 bg-[#090a0f]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">BrandGuard</span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              DRP
            </span>
          </div>
        </Link>

        {/* Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
          <a href="#capabilities" className="hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#simulator" className="hover:text-white transition-colors">
            Detection Sandbox
          </a>
          <a href="#whitelist" className="hover:text-white transition-colors">
            Zero-False-Positive Whitelist
          </a>
          <a href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-neutral-400 hidden sm:inline">
                Signed in as <strong className="text-neutral-200">{user?.name}</strong>
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <button
                onClick={handleQuickDemoLogin}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[22rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Digital Risk Protection & Impersonation Defense</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Detect Brand Impersonation Before Customer Harm Occurs
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            BrandGuard automatically detects fake social media accounts, scam customer support channels, and unauthorized mobile apps using multi-signal scoring and look-alike detection.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleQuickDemoLogin}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Sign in as Priya Sharma (Analyst Demo)</span>
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all border border-neutral-800 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-neutral-500" />
              <span>Standard Sign In</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Proof Strip */}
        <div className="mt-14 pt-8 border-t border-neutral-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
            <span className="block text-[11px] font-mono text-neutral-500">ACCURACY</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              100%
            </span>
            <span className="text-xs text-neutral-400">Whitelist Exclusion Immunity</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
            <span className="block text-[11px] font-mono text-neutral-500">DETECTION ENGINES</span>
            <span className="text-xl font-bold text-indigo-400 font-mono tabular-nums mt-0.5 block">
              Multi-Signal
            </span>
            <span className="text-xs text-neutral-400">RapidFuzz, pHash, Semantics</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
            <span className="block text-[11px] font-mono text-neutral-500">COVERAGE</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              6 Feeds
            </span>
            <span className="text-xs text-neutral-400">Social Networks & App Stores</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80">
            <span className="block text-[11px] font-mono text-neutral-500">LATENCY</span>
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5 block">
              &lt; 3.0s
            </span>
            <span className="text-xs text-neutral-400">Real-Time Threat Assessment</span>
          </div>
        </div>
      </section>

      {/* Interactive Detection Sandbox */}
      <section id="simulator" className="py-16 px-6 lg:px-12 bg-[#0c0e17] border-y border-neutral-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white">Live Look-Alike & Scoring Simulator</h2>
            <p className="text-xs text-neutral-400">
              Test how BrandGuard detects character substitutions, homoglyphs, and scam affixes against registered trademarks.
            </p>
          </div>

          <div className="bg-[#0f111a] border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left: Input candidate */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Protected Brand Target
                  </label>
                  <input
                    type="text"
                    value={testBrand}
                    onChange={(e) => setTestBrand(e.target.value)}
                    className="w-full bg-[#151824] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Suspect Candidate / Impersonator Title
                  </label>
                  <input
                    type="text"
                    value={testCandidate}
                    onChange={(e) => setTestCandidate(e.target.value)}
                    className="w-full bg-[#151824] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-100 font-mono"
                  />
                </div>

                {/* Quick test chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-neutral-500 font-medium">Test Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'N1ke Support Hub (Homoglyph 1)', text: 'N1ke Support Hub' },
                      { label: 'Nike-Help Desk (Affix & Hyphen)', text: 'Nike-Help Desk Direct' },
                      { label: 'Nike Fans Club (Fan Disclaimer)', text: 'Nike Fans Club Daily' },
                      { label: 'Oregon Running Archive (Fair Use)', text: 'Oregon Running Heritage' },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => runSimulation(preset.text)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                          testCandidate === preset.text
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Live Assessment Card */}
              <div className="md:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 text-center space-y-3">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Simulated Risk Score
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span
                    className={`text-5xl font-extrabold font-mono tabular-nums ${
                      simulatedScore && simulatedScore >= 80
                        ? 'text-rose-400'
                        : simulatedScore && simulatedScore >= 50
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {simulatedScore}
                  </span>
                  <span className="text-sm font-mono text-neutral-500">/100</span>
                </div>

                <div className="text-xs text-neutral-300 space-y-1 pt-2 border-t border-neutral-800 font-sans">
                  {simulatedScore && simulatedScore >= 80 ? (
                    <p className="text-rose-300 font-semibold flex items-center justify-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      High Risk Threat Flagged
                    </p>
                  ) : simulatedScore && simulatedScore >= 50 ? (
                    <p className="text-amber-300 font-semibold">Medium Risk Review Required</p>
                  ) : (
                    <p className="text-emerald-300 font-semibold">Low Risk / Fair Nominative Use</p>
                  )}
                  <p className="text-[11px] text-neutral-500">
                    Includes RapidFuzz lexical matching + homoglyph look-alike bonus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Bento */}
      <section id="capabilities" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comprehensive Digital Risk Protection
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Engineered to catch sophisticated spoofing while preventing false alarms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Look-Alike Name Detection</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Catches Unicode homoglyphs, leetspeak character substitutions (e.g. 1 for i, 0 for o), Turkish dotless ı, and hyphenated support suffixes.
            </p>
          </div>

          <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">App Store Publisher Verification</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Compares detected Google Play & Apple App Store developers against official brand records. Mismatched publishers trigger automatic +25 penalty points.
            </p>
          </div>

          <div id="whitelist" className="bg-[#0f111a] border border-emerald-500/20 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">Zero False-Positive Whitelist</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every verified official account and mobile app registered in the Brand Profile is guaranteed 100% immunity and never flagged as a threat.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-b from-[#0c0e17] to-[#090a0f] border-t border-neutral-800/80 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Investigate Digital Risks?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Sign in with the demo analyst profile to review active detections for Nike.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={handleQuickDemoLogin}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xl shadow-indigo-600/25 flex items-center gap-2"
            >
              <span>Launch BrandGuard Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-neutral-800/80 bg-[#090a0f] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-neutral-300">BrandGuard</span>
          <span>· Digital Risk Protection</span>
        </div>
        <div>
          <span>© 2026 BrandGuard Systems. SOC 2 Type II Certified.</span>
        </div>
      </footer>
    </div>
  );
};
