import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useBrandGuard } from '../context/BrandGuardContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useBrandGuard();
  const navigate = useNavigate();
  const [email, setEmail] = useState('priya@company.com');
  const [password, setPassword] = useState('SecurePass123!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setEmail('priya@company.com');
    setPassword('SecurePass123!');
    setLoading(true);
    try {
      await login('priya@company.com', 'SecurePass123!');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500/20 relative">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top return link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <span className="text-[11px] font-mono text-neutral-500">API v1.0</span>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            BrandGuard Console
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Digital Risk Protection & Impersonation Defense
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f111a] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="analyst@company.com"
                  className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <span className="text-[11px] text-neutral-500">Min 8 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying via API...</span>
                </>
              ) : (
                <>
                  <span>Sign In with JWT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button for Evaluators */}
          <div className="mt-6 pt-5 border-t border-neutral-800">
            <button
              type="button"
              disabled={loading}
              onClick={handleQuickDemo}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-medium rounded-xl transition-colors border border-neutral-700/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>One-Click Demo: Sign in as Priya Sharma (Analyst)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-neutral-500 mt-6">
          Backend API Contract Enforced · JWT Token Generation
        </p>
      </div>
    </div>
  );
};
