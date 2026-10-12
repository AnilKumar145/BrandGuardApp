export type RiskLevel = 'high' | 'medium' | 'low';

export type DetectionStatus = 'needs_review' | 'reviewed' | 'false_positive' | 'escalated';

export type SourceType = 'social' | 'app_store';

export type SocialPlatform = 'x' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin';

export type AppStorePlatform = 'google_play' | 'app_store';

export type Platform = SocialPlatform | AppStorePlatform;

export interface OfficialSocialAccount {
  id: string;
  platform: SocialPlatform;
  handle: string;
  url: string;
  isVerified: boolean;
  addedAt: string;
}

export interface OfficialApp {
  id: string;
  name: string;
  store: AppStorePlatform;
  developerName: string;
  packageId: string;
  storeUrl?: string;
  logoUrl?: string;
  addedAt: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  normalizedName: string;
  website: string;
  logoUrl: string;
  description: string;
  officialSocialAccounts: OfficialSocialAccount[];
  officialApps: OfficialApp[];
  lastScanAt: string;
  updatedAt: string;
}

export interface SignalBreakdown {
  nameSimilarity: number;        // 0 to 100
  logoSimilarity: number;        // 0 to 100
  descriptionSimilarity: number; // 0 to 100
  lookalikeBonus: number;        // 0 to 20
  publisherMismatch?: {
    expected: string;
    detected: string;
    isMismatch: boolean;
    penalty: number;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  previousStatus?: DetectionStatus;
  newStatus?: DetectionStatus;
  note?: string;
}

export interface Detection {
  id: string;
  brandId: string;
  sourceType: SourceType;
  platform: Platform;
  title: string;
  url: string;
  handleOrPackage: string;
  developerOrOwner: string;
  description: string;
  logoUrl: string;
  riskScore: number;             // 0 to 100
  riskLevel: RiskLevel;
  status: DetectionStatus;
  signals: SignalBreakdown;
  evidence: string[];
  detectedAt: string;
  updatedAt: string;
  auditLogs: AuditLogEntry[];
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface DashboardSummary {
  totalDetections: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  needsReview: number;
  reviewed: number;
  falsePositive: number;
  escalated: number;
  lastScanAt: string;
  bySource: {
    social: number;
    appStore: number;
  };
  byPlatform: Record<Platform, number>;
}
