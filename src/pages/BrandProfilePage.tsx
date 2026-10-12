import React, { useState } from 'react';
import { useBrandGuard } from '../context/BrandGuardContext';
import { SocialPlatform, AppStorePlatform } from '../types';
import { PlatformBadge } from '../components/ui/PlatformBadge';
import {
  Building2,
  Globe,
  UploadCloud,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const BrandProfilePage: React.FC = () => {
  const {
    brand,
    updateBrand,
    addSocialAccount,
    removeSocialAccount,
    addApp,
    removeApp,
  } = useBrandGuard();

  // Local state for brand details form
  const [brandName, setBrandName] = useState(brand.name);
  const [website, setWebsite] = useState(brand.website);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [description, setDescription] = useState(brand.description);

  // Social account form state
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('x');
  const [socialHandle, setSocialHandle] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  // App form state
  const [appName, setAppName] = useState('');
  const [appStore, setAppStore] = useState<AppStorePlatform>('google_play');
  const [developerName, setDeveloperName] = useState('Nike, Inc.');
  const [packageId, setPackageId] = useState('');

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand({
      name: brandName,
      website,
      logoUrl,
      description,
    });
  };

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialHandle.trim()) return;
    const formattedHandle = socialHandle.startsWith('@')
      ? socialHandle.trim()
      : `@${socialHandle.trim()}`;
    const success = await addSocialAccount({
      platform: socialPlatform,
      handle: formattedHandle,
      url: socialUrl || `https://${socialPlatform}.com/${formattedHandle.replace('@', '')}`,
      isVerified,
    });
    if (success) {
      setSocialHandle('');
      setSocialUrl('');
    }
  };

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !packageId.trim() || !developerName.trim()) return;
    const success = await addApp({
      name: appName.trim(),
      store: appStore,
      developerName: developerName.trim(),
      packageId: packageId.trim(),
      storeUrl:
        appStore === 'google_play'
          ? `https://play.google.com/store/apps/details?id=${packageId.trim()}`
          : `https://apps.apple.com/app/${appName.toLowerCase().replace(/\s+/g, '-')}/id${Math.floor(1000000000 + Math.random() * 900000000)}`,
      logoUrl: brand.logoUrl,
    });
    if (success) {
      setAppName('');
      setPackageId('');
    }
  };

  // Sample logos for quick switching
  const sampleLogos = [
    { label: 'Nike Swoosh (SVG)', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { label: 'Nike Vintage', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Brand Profile & Official Asset Registry
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Manage your legitimate brand identity. All official social accounts and mobile apps listed here are marked as excluded so they are <strong>never flagged</strong> as impersonations.
        </p>
      </div>

      {/* Exclusion Principle Banner */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed">
          <h4 className="font-semibold text-indigo-200 text-sm">
            Zero False-Positive Whitelist Guarantee
          </h4>
          <p className="text-neutral-300 mt-1">
            BrandGuard uses exact cryptographic match hashes and canonical handle normalizers. Any incoming detection candidate that matches an official asset in this registry is instantly discarded before scoring, ensuring 100% false-positive immunity.
          </p>
        </div>
      </div>

      {/* Brand Profile Form */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <span>Core Brand Information</span>
        </h2>

        <form onSubmit={handleSaveBrand} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. Nike"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Official Website *
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="https://www.nike.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Brand Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl p-3 text-sm text-neutral-100 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Brief description of official brand identity..."
            />
          </div>

          {/* Logo Upload & Preview */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Official Trademark Logo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Preview Box */}
              <div className="sm:col-span-1 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-lg p-2 flex items-center justify-center border border-neutral-700 shadow-sm">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brandName}
                      style={{ maxHeight: '64px', maxWidth: '64px', objectFit: 'contain' }}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 mt-2 font-mono">Current Vector/Logo</span>
              </div>

              {/* Upload Input & Presets */}
              <div className="sm:col-span-2 space-y-3">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-[#151824] border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="Logo URL (SVG or PNG recommended)"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-neutral-500">Presets:</span>
                  {sampleLogos.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setLogoUrl(s.url)}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-lg border border-neutral-700 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Brand Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Official Social Accounts Section */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Official Social Accounts ({brand.officialSocialAccounts.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Profiles registered here are excluded from impersonation crawler alerts.
            </p>
          </div>
        </div>

        {/* List of Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {brand.officialSocialAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-neutral-900/90 border border-neutral-800/90 rounded-xl p-3.5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <PlatformBadge platform={account.platform} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-100 font-mono truncate">
                    {account.handle}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {account.isVerified && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-neutral-500 hover:text-neutral-300"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeSocialAccount(account.id)}
                className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-colors"
                title="Remove account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Account Form */}
        <form
          onSubmit={handleAddSocial}
          className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3"
        >
          <h3 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Official Social Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-400 mb-1">Platform</label>
              <select
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value as SocialPlatform)}
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="x">X / Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] text-neutral-400 mb-1">Handle *</label>
              <input
                type="text"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="@handle"
                required
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-400 mb-1">Profile URL (Optional)</label>
              <input
                type="url"
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Official Mobile Apps Section */}
      <div className="bg-[#0f111a] border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">
              Official Mobile Apps ({brand.officialApps.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Apps registered with official package IDs and verified developer name.
            </p>
          </div>
        </div>

        {/* List of Apps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brand.officialApps.map((app) => (
            <div
              key={app.id}
              className="bg-neutral-900/90 border border-neutral-800/90 rounded-xl p-4 flex items-start justify-between group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shrink-0 p-1">
                  <PlatformBadge platform={app.store} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-100 truncate">{app.name}</h4>
                  <p className="text-[11px] font-mono text-indigo-300 mt-0.5 truncate">
                    {app.packageId}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Developer: <strong className="text-neutral-300 font-medium">{app.developerName}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeApp(app.id)}
                className="text-neutral-500 hover:text-rose-400 p-1.5 rounded-lg opacity-80 hover:opacity-100 transition-colors"
                title="Remove official app"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add App Form */}
        <form
          onSubmit={handleAddApp}
          className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-3"
        >
          <h3 className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Register Official Mobile Application</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-400 mb-1">Store *</label>
              <select
                value={appStore}
                onChange={(e) => setAppStore(e.target.value as AppStorePlatform)}
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="google_play">Google Play Store</option>
                <option value="app_store">Apple App Store</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-400 mb-1">App Title *</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="e.g. Nike Training Club"
                required
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-neutral-400 mb-1">Package ID / Bundle *</label>
              <input
                type="text"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                placeholder="com.nike.ntc"
                required
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] text-neutral-400 mb-1">Developer Name *</label>
              <input
                type="text"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Nike, Inc."
                required
                className="w-full bg-[#151824] border border-neutral-700/80 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
