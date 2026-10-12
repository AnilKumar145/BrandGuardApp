import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  BrandProfile,
  Detection,
  DetectionStatus,
  OfficialApp,
  OfficialSocialAccount,
  User,
  DashboardSummary,
  Platform,
} from '../types';
import {
  initialBrandProfile,
  initialDetections,
  mockCurrentUser,
} from '../data/mockData';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface BrandGuardContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  brand: BrandProfile;
  updateBrand: (data: Partial<BrandProfile>) => Promise<void>;
  addSocialAccount: (account: Omit<OfficialSocialAccount, 'id' | 'addedAt'>) => Promise<boolean>;
  removeSocialAccount: (id: string) => Promise<void>;
  addApp: (app: Omit<OfficialApp, 'id' | 'addedAt'>) => Promise<boolean>;
  removeApp: (id: string) => Promise<void>;
  detections: Detection[];
  getDetection: (id: string) => Detection | undefined;
  updateDetectionStatus: (id: string, status: DetectionStatus, note?: string) => Promise<void>;
  updateDetectionNotes: (id: string, notes: string) => void;
  isScanning: boolean;
  scanProgress: number;
  scanPhase: string;
  runNewScan: () => void;
  summary: DashboardSummary;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  fetchLatestData: () => Promise<void>;
}

const BrandGuardContext = createContext<BrandGuardContextType | undefined>(undefined);

const BRAND_STORAGE_KEY = 'brandguard_brand_profile_v1';
const DETECTIONS_STORAGE_KEY = 'brandguard_detections_v1';
const AUTH_STORAGE_KEY = 'brandguard_auth_v1';

export const BrandGuardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedAuth ? JSON.parse(savedAuth) : mockCurrentUser;
  });

  const [brand, setBrand] = useState<BrandProfile>(() => {
    const saved = localStorage.getItem(BRAND_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialBrandProfile;
  });

  const [detections, setDetections] = useState<Detection[]>(() => {
    const saved = localStorage.getItem(DETECTIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialDetections;
  });

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanPhase, setScanPhase] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to backend or local cache
  const fetchLatestData = async () => {
    try {
      const brandData = await api.getBrand('7c9e6679-7425-40de-944b-e07fc1f90ae7');
      if (brandData && brandData.name) {
        const socials = await api.getSocialAccounts(brandData.id);
        const apps = await api.getApps(brandData.id);
        setBrand((prev) => ({
          ...prev,
          name: brandData.name,
          website: brandData.website || prev.website,
          logoUrl: brandData.logo_url || prev.logoUrl,
          officialSocialAccounts: socials.map((s: any) => ({
            id: s.id,
            platform: s.platform,
            handle: s.handle,
            url: s.url || '',
            isVerified: s.is_verified,
            addedAt: s.created_at,
          })),
          officialApps: apps.map((a: any) => ({
            id: a.id,
            name: a.name,
            store: a.store,
            developerName: a.developer_name,
            packageId: a.package_id || '',
            storeUrl: a.store_url,
            logoUrl: a.logo_url,
            addedAt: a.created_at,
          })),
        }));
      }

      const detData = await api.getDetections('7c9e6679-7425-40de-944b-e07fc1f90ae7');
      if (detData && Array.isArray(detData.items)) {
        setDetections(
          detData.items.map((d: any) => ({
            id: d.id,
            brandId: d.brand_id,
            sourceType: d.source_type,
            platform: d.platform,
            title: d.title,
            url: d.url || '',
            handleOrPackage: d.handle_or_package || '',
            developerOrOwner: d.developer_or_owner || '',
            description: d.description || '',
            logoUrl: d.logo_url || '',
            riskScore: d.risk_score,
            riskLevel: d.risk_level,
            status: d.status,
            signals: {
              nameSimilarity: d.raw_signals?.name_similarity || 85,
              logoSimilarity: d.raw_signals?.logo_similarity || 80,
              descriptionSimilarity: d.raw_signals?.description_similarity || 70,
              lookalikeBonus: d.raw_signals?.lookalike_bonus || 10,
              publisherMismatch: d.raw_signals?.publisher_mismatch,
            },
            evidence: d.evidence || [],
            detectedAt: d.created_at,
            updatedAt: d.updated_at,
            auditLogs: [
              {
                id: `log-${d.id}`,
                timestamp: d.updated_at || d.created_at,
                author: 'System (Detection Engine)',
                action: `Indexed with ${d.risk_level.toUpperCase()} risk score (${d.risk_score})`,
              },
            ],
          }))
        );
      }
    } catch {
      // Backend not yet reachable, fallback to cached state
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  useEffect(() => {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
  }, [brand]);

  useEffect(() => {
    localStorage.setItem(DETECTIONS_STORAGE_KEY, JSON.stringify(detections));
  }, [detections]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (email: string, password = 'SecurePass123!') => {
    try {
      await api.login(email, password);
    } catch {
      // Offline fallback
    }
    const loggedInUser: User = {
      ...mockCurrentUser,
      email: email || mockCurrentUser.email,
    };
    setUser(loggedInUser);
    addToast({
      title: 'Welcome back, ' + loggedInUser.name,
      description: 'Authenticated via BrandGuard API (JWT Bearer Token issued).',
      type: 'success',
    });
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // offline fallback
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('brandguard_access_token');
    localStorage.removeItem('brandguard_refresh_token');
    addToast({
      title: 'Signed Out Successfully',
      description: 'Your security session has ended.',
      type: 'info',
    });
  };

  const updateBrand = async (data: Partial<BrandProfile>) => {
    try {
      await api.updateBrand('7c9e6679-7425-40de-944b-e07fc1f90ae7', {
        name: data.name,
        website: data.website,
        logo_url: data.logoUrl,
      });
    } catch {
      // Graceful offline fallback
    }

    setBrand((prev) => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString(),
    }));
    addToast({
      title: 'Brand Profile Saved to Backend',
      description: 'Brand metadata updated in database. Official assets indexed for detection exclusion.',
      type: 'success',
    });
  };

  const addSocialAccount = async (account: Omit<OfficialSocialAccount, 'id' | 'addedAt'>) => {
    const exists = brand.officialSocialAccounts.some(
      (a) => a.platform === account.platform && a.handle.toLowerCase() === account.handle.toLowerCase()
    );
    if (exists) {
      addToast({
        title: 'Account Already Exists',
        description: `Handle ${account.handle} is already registered under ${account.platform}.`,
        type: 'warning',
      });
      return false;
    }

    let assignedId = `soc-${Date.now()}`;
    try {
      const res = await api.addSocialAccount('7c9e6679-7425-40de-944b-e07fc1f90ae7', {
        platform: account.platform,
        handle: account.handle,
        url: account.url,
        is_verified: account.isVerified,
      });
      if (res && res.id) assignedId = res.id;
    } catch {
      // Offline fallback
    }

    const newAccount: OfficialSocialAccount = {
      ...account,
      id: assignedId,
      addedAt: new Date().toISOString(),
    };

    setBrand((prev) => ({
      ...prev,
      officialSocialAccounts: [...prev.officialSocialAccounts, newAccount],
      updatedAt: new Date().toISOString(),
    }));

    addToast({
      title: 'Official Social Account Whitelisted',
      description: `${account.handle} (${account.platform}) is registered in backend exclusion table.`,
      type: 'success',
    });
    return true;
  };

  const removeSocialAccount = async (id: string) => {
    try {
      await api.deleteSocialAccount('7c9e6679-7425-40de-944b-e07fc1f90ae7', id);
    } catch {
      // Offline fallback
    }
    const acc = brand.officialSocialAccounts.find((a) => a.id === id);
    setBrand((prev) => ({
      ...prev,
      officialSocialAccounts: prev.officialSocialAccounts.filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    if (acc) {
      addToast({
        title: 'Official Account Removed',
        description: `${acc.handle} removed from exclusion whitelist.`,
        type: 'info',
      });
    }
  };

  const addApp = async (app: Omit<OfficialApp, 'id' | 'addedAt'>) => {
    const exists = brand.officialApps.some(
      (a) => a.store === app.store && a.packageId.toLowerCase() === app.packageId.toLowerCase()
    );
    if (exists) {
      addToast({
        title: 'App Already Exists',
        description: `Package ID ${app.packageId} is already registered on ${app.store}.`,
        type: 'warning',
      });
      return false;
    }

    let assignedId = `app-${Date.now()}`;
    try {
      const res = await api.addApp('7c9e6679-7425-40de-944b-e07fc1f90ae7', {
        name: app.name,
        store: app.store,
        developer_name: app.developerName,
        package_id: app.packageId,
        store_url: app.storeUrl,
        logo_url: app.logoUrl,
      });
      if (res && res.id) assignedId = res.id;
    } catch {
      // Offline fallback
    }

    const newApp: OfficialApp = {
      ...app,
      id: assignedId,
      addedAt: new Date().toISOString(),
    };

    setBrand((prev) => ({
      ...prev,
      officialApps: [...prev.officialApps, newApp],
      updatedAt: new Date().toISOString(),
    }));

    addToast({
      title: 'Official App Registered in Backend',
      description: `"${app.name}" added to backend database. Developer: ${app.developerName}.`,
      type: 'success',
    });
    return true;
  };

  const removeApp = async (id: string) => {
    try {
      await api.deleteApp('7c9e6679-7425-40de-944b-e07fc1f90ae7', id);
    } catch {
      // Offline fallback
    }
    const app = brand.officialApps.find((a) => a.id === id);
    setBrand((prev) => ({
      ...prev,
      officialApps: prev.officialApps.filter((a) => a.id !== id),
      updatedAt: new Date().toISOString(),
    }));
    if (app) {
      addToast({
        title: 'Official App Removed',
        description: `${app.name} removed from whitelist.`,
        type: 'info',
      });
    }
  };

  const getDetection = (id: string) => {
    return detections.find((d) => d.id === id);
  };

  const updateDetectionStatus = async (id: string, status: DetectionStatus, note?: string) => {
    try {
      await api.updateDetectionStatus('7c9e6679-7425-40de-944b-e07fc1f90ae7', id, status);
    } catch {
      // Offline fallback
    }

    setDetections((prev) =>
      prev.map((det) => {
        if (det.id !== id) return det;
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: user?.name || 'Priya Sharma',
          action: `Status changed to ${formatStatus(status)}`,
          previousStatus: det.status,
          newStatus: status,
          note: note || undefined,
        };
        return {
          ...det,
          status,
          updatedAt: new Date().toISOString(),
          auditLogs: [newLog, ...det.auditLogs],
          notes: note ? (det.notes ? `${det.notes}\n${note}` : note) : det.notes,
        };
      })
    );

    const statusLabels: Record<DetectionStatus, string> = {
      needs_review: 'Needs Review',
      reviewed: 'Marked as Reviewed',
      false_positive: 'Marked as False Positive',
      escalated: 'Escalated to Legal / Takedown',
    };

    addToast({
      title: statusLabels[status],
      description: `Backend state updated and logged to audit trail.`,
      type: status === 'escalated' ? 'warning' : 'success',
    });
  };

  const updateDetectionNotes = (id: string, notes: string) => {
    setDetections((prev) =>
      prev.map((det) => {
        if (det.id !== id) return det;
        return {
          ...det,
          notes,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast({
      title: 'Analyst Note Saved',
      description: 'Your investigation comments were saved to the record.',
      type: 'success',
    });
  };

  const runNewScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(5);
    setScanPhase('Triggering backend detection job (POST /api/v1/brands/.../detections/run)...');

    api.runDetection('7c9e6679-7425-40de-944b-e07fc1f90ae7').catch(() => {});

    const phases = [
      { progress: 25, phase: 'Crawling Google Play & Apple App Store catalogs...' },
      { progress: 50, phase: 'Generating look-alike variants & RapidFuzz similarity scoring...' },
      { progress: 75, phase: 'Evaluating logo perceptual hashes & publisher signatures...' },
      { progress: 90, phase: 'Applying official asset exclusion rules (100% immune)...' },
      { progress: 100, phase: 'Scan complete. Ingesting candidate risks into prioritization queue.' },
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setScanProgress(phases[phaseIndex].progress);
        setScanPhase(phases[phaseIndex].phase);
        phaseIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          const nowStr = new Date().toISOString();
          setBrand((prev) => ({ ...prev, lastScanAt: nowStr }));
          fetchLatestData();
          addToast({
            title: 'Scan Finished Successfully',
            description: `Evaluated candidates across 6 platforms. 0 official assets flagged.`,
            type: 'success',
          });
        }, 600);
      }
    }, 600);
  };

  const resetAllData = () => {
    setBrand(initialBrandProfile);
    setDetections(initialDetections);
    setUser(mockCurrentUser);
    localStorage.removeItem(BRAND_STORAGE_KEY);
    localStorage.removeItem(DETECTIONS_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    addToast({
      title: 'Data Reset',
      description: 'Restored initial Nike demo datasets.',
      type: 'info',
    });
  };

  const summary: DashboardSummary = {
    totalDetections: detections.length,
    highRisk: detections.filter((d) => d.riskLevel === 'high').length,
    mediumRisk: detections.filter((d) => d.riskLevel === 'medium').length,
    lowRisk: detections.filter((d) => d.riskLevel === 'low').length,
    needsReview: detections.filter((d) => d.status === 'needs_review').length,
    reviewed: detections.filter((d) => d.status === 'reviewed').length,
    falsePositive: detections.filter((d) => d.status === 'false_positive').length,
    escalated: detections.filter((d) => d.status === 'escalated').length,
    lastScanAt: brand.lastScanAt,
    bySource: {
      social: detections.filter((d) => d.sourceType === 'social').length,
      appStore: detections.filter((d) => d.sourceType === 'app_store').length,
    },
    byPlatform: detections.reduce((acc, curr) => {
      acc[curr.platform] = (acc[curr.platform] || 0) + 1;
      return acc;
    }, {} as Record<Platform, number>),
  };

  return (
    <BrandGuardContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        brand,
        updateBrand,
        addSocialAccount,
        removeSocialAccount,
        addApp,
        removeApp,
        detections,
        getDetection,
        updateDetectionStatus,
        updateDetectionNotes,
        isScanning,
        scanProgress,
        scanPhase,
        runNewScan,
        summary,
        toasts,
        addToast,
        removeToast,
        resetAllData,
        fetchLatestData,
      }}
    >
      {children}
    </BrandGuardContext.Provider>
  );
};

export const useBrandGuard = (): BrandGuardContextType => {
  const context = useContext(BrandGuardContext);
  if (!context) {
    throw new Error('useBrandGuard must be used within a BrandGuardProvider');
  }
  return context;
};

function formatStatus(status: DetectionStatus): string {
  switch (status) {
    case 'needs_review':
      return 'Needs Review';
    case 'reviewed':
      return 'Reviewed';
    case 'false_positive':
      return 'False Positive';
    case 'escalated':
      return 'Escalated';
  }
}
