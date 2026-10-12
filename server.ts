import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// In-Memory Database store seeded with Nike ground truth
interface UserStore {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

interface SocialStore {
  id: string;
  brand_id: string;
  platform: string;
  handle: string;
  url?: string;
  is_verified: boolean;
  created_at: string;
}

interface AppStoreItem {
  id: string;
  brand_id: string;
  name: string;
  package_id?: string;
  developer_name: string;
  store: string;
  store_url?: string;
  logo_url?: string;
  created_at: string;
}

interface BrandStore {
  id: string;
  owner_id: string;
  name: string;
  normalized_name: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface DetectionStore {
  id: string;
  brand_id: string;
  source_type: string;
  platform: string;
  title: string;
  url?: string;
  handle_or_package?: string;
  developer_or_owner?: string;
  description?: string;
  logo_url?: string;
  risk_score: number;
  risk_level: string;
  status: string;
  is_official_excluded: boolean;
  raw_signals?: any;
  evidence: string[];
  created_at: string;
  updated_at: string;
}

const user: UserStore = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'priya@company.com',
  full_name: 'Priya Sharma',
  is_active: true,
  created_at: '2026-10-01T10:00:00Z',
};

const brand: BrandStore = {
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  owner_id: user.id,
  name: 'Nike',
  normalized_name: 'nike',
  website: 'https://www.nike.com',
  logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  created_at: '2026-10-12T08:00:00Z',
  updated_at: '2026-10-12T08:00:00Z',
};

let officialSocials: SocialStore[] = [
  { id: 'soc-1', brand_id: brand.id, platform: 'x', handle: '@Nike', url: 'https://x.com/Nike', is_verified: true, created_at: '2026-10-12T08:05:00Z' },
  { id: 'soc-2', brand_id: brand.id, platform: 'instagram', handle: '@nike', url: 'https://instagram.com/nike', is_verified: true, created_at: '2026-10-12T08:05:00Z' },
  { id: 'soc-3', brand_id: brand.id, platform: 'facebook', handle: 'Nike', url: 'https://facebook.com/nike', is_verified: true, created_at: '2026-10-12T08:05:00Z' },
  { id: 'soc-4', brand_id: brand.id, platform: 'tiktok', handle: '@nike', url: 'https://tiktok.com/@nike', is_verified: true, created_at: '2026-10-12T08:05:00Z' },
  { id: 'soc-5', brand_id: brand.id, platform: 'youtube', handle: 'Nike', url: 'https://youtube.com/nike', is_verified: true, created_at: '2026-10-12T08:05:00Z' },
];

let officialApps: AppStoreItem[] = [
  { id: 'app-1', brand_id: brand.id, name: 'Nike: Shoes, Apparel & Stories', package_id: 'com.nike.omega', developer_name: 'Nike, Inc.', store: 'google_play', store_url: 'https://play.google.com/store/apps/details?id=com.nike.omega', logo_url: brand.logo_url, created_at: '2026-10-12T08:05:00Z' },
  { id: 'app-2', brand_id: brand.id, name: 'Nike SNKRS: Release Dates', package_id: 'com.nike.snkrs', developer_name: 'Nike, Inc.', store: 'app_store', store_url: 'https://apps.apple.com/app/nike-snkrs/id1044458572', logo_url: brand.logo_url, created_at: '2026-10-12T08:05:00Z' },
];

let detections: DetectionStore[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'x',
    title: 'N1ke Support Hub Direct',
    url: 'https://x.com/N1keSupportDirect',
    handle_or_package: '@N1keSupportDirect',
    developer_or_owner: 'Unverified Account (Created Oct 2026)',
    description: 'Official direct Twitter live assistance for Nike order cancellation, refunds, and promo code support. DM us your receipt.',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120',
    risk_score: 94.0,
    risk_level: 'high',
    status: 'needs_review',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 92.0,
      logo_similarity: 88.0,
      description_similarity: 78.0,
      lookalike_bonus: 18.0,
    },
    evidence: [
      'Character substitution detected: Number "1" substituted for letter "i" (N1ke vs Nike)',
      'High-risk brand keywords: "Support", "Hub", "Refunds", "DM us"',
      'Perceptual logo hash distance < 6 indicating cropped trademark swoosh reproduction',
    ],
    created_at: '2026-10-12T06:45:00Z',
    updated_at: '2026-10-12T06:45:00Z',
  },
  {
    id: 'det-002-app',
    brand_id: brand.id,
    source_type: 'app_store',
    platform: 'google_play',
    title: 'Nike Shoes Direct Online Store',
    url: 'https://play.google.com/store/apps/details?id=com.shopping.nike.direct',
    handle_or_package: 'com.shopping.nike.direct',
    developer_or_owner: 'Apex Global Retail LLC',
    description: 'Download the official direct shop to buy authentic Nike sneakers, Jordans, and apparel at 70% wholesale discount with crypto checkout.',
    logo_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=120',
    risk_score: 92.0,
    risk_level: 'high',
    status: 'needs_review',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 95.0,
      logo_similarity: 91.0,
      description_similarity: 82.0,
      lookalike_bonus: 10.0,
      publisher_mismatch: {
        expected: 'Nike, Inc.',
        detected: 'Apex Global Retail LLC',
        is_mismatch: true,
        penalty: 25.0,
      },
    },
    evidence: [
      'CRITICAL: Developer name mismatch! Expected "Nike, Inc.", found "Apex Global Retail LLC"',
      'App package namespace mimics official brand ("com.shopping.nike.direct")',
      'High trademark infringement: uses authentic Nike product imagery and swoosh icon',
    ],
    created_at: '2026-10-12T05:20:00Z',
    updated_at: '2026-10-12T05:20:00Z',
  },
  {
    id: 'det-003-fb',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'facebook',
    title: 'Nike-Help Desk Official Support',
    url: 'https://facebook.com/NikeHelpDeskDirect2026',
    handle_or_package: 'NikeHelpDeskDirect2026',
    developer_or_owner: 'Page Category: Financial Consulting',
    description: 'Instant customer resolution center for Nike Member Rewards, SNKRS app raffle disputes, and compromised account recovery.',
    logo_url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=120',
    risk_score: 89.0,
    risk_level: 'high',
    status: 'needs_review',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 88.0,
      logo_similarity: 84.0,
      description_similarity: 76.0,
      lookalike_bonus: 16.0,
    },
    evidence: [
      'Hyphenated look-alike pattern: "Nike-Help"',
      'Official impersonation claim: Page title falsely declares "Official Support"',
      'Mismatched page classification: Registered as "Financial Consulting" instead of Sportswear/Retail',
    ],
    created_at: '2026-10-12T04:10:00Z',
    updated_at: '2026-10-12T04:10:00Z',
  },
  {
    id: 'det-004-snkrs',
    brand_id: brand.id,
    source_type: 'app_store',
    platform: 'app_store',
    title: 'SNKRS Bot & Exclusive Drop Tracker',
    url: 'https://apps.apple.com/app/snkrs-bot-exclusive-drops/id1699238410',
    handle_or_package: 'io.snkrsbot.exclusive',
    developer_or_owner: 'SneakerPro Tech Labs',
    description: 'Automate your Nike SNKRS raffle entries, bypass queues, and auto-purchase limited Dunks & Jordan 1s. $29.99/mo subscription.',
    logo_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=120',
    risk_score: 88.0,
    risk_level: 'high',
    status: 'escalated',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 84.0,
      logo_similarity: 82.0,
      description_similarity: 74.0,
      lookalike_bonus: 14.0,
      publisher_mismatch: {
        expected: 'Nike, Inc.',
        detected: 'SneakerPro Tech Labs',
        is_mismatch: true,
        penalty: 20.0,
      },
    },
    evidence: [
      'Direct trademark infringement on proprietary brand sub-mark "SNKRS"',
      'Publisher is third-party ("SneakerPro Tech Labs") with no brand affiliation',
      'Promotes TOS-violating botting against Nike SNKRS drop servers',
    ],
    created_at: '2026-10-11T22:30:00Z',
    updated_at: '2026-10-12T02:15:00Z',
  },
  {
    id: 'det-005-tiktok',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'tiktok',
    title: 'Nıke VIP Members Club Exclusive',
    url: 'https://tiktok.com/@nike_vip_exclusive_drops',
    handle_or_package: '@nike_vip_exclusive_drops',
    developer_or_owner: 'TikTok Creator Account (No bio verification)',
    description: 'Claim your $250 free Nike gift card. Tap link in bio. Limited to first 500 members! Just Do It!',
    logo_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=120',
    risk_score: 86.0,
    risk_level: 'high',
    status: 'needs_review',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 90.0,
      logo_similarity: 85.0,
      description_similarity: 72.0,
      lookalike_bonus: 20.0,
    },
    evidence: [
      'Unicode Homoglyph: Uses Turkish dotless "ı" (U+0131) instead of standard "i"',
      'Trademarked slogan misappropriation: Uses "Just Do It!" to induce consumer trust',
    ],
    created_at: '2026-10-11T19:00:00Z',
    updated_at: '2026-10-11T19:00:00Z',
  },
  {
    id: 'det-006-ig',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'instagram',
    title: 'Nike Outlet Global Clearance 2026',
    url: 'https://instagram.com/nike_outlet_clearance_sale',
    handle_or_package: '@nike_outlet_clearance_sale',
    developer_or_owner: 'Business Account (Location: Guangzhou)',
    description: 'Worldwide Nike warehouse liquidation! Overstock shoes, Air Force 1s, Air Max at up to 85% discount. Free shipping worldwide.',
    logo_url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=120',
    risk_score: 84.0,
    risk_level: 'high',
    status: 'needs_review',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 89.0,
      logo_similarity: 82.0,
      description_similarity: 75.0,
      lookalike_bonus: 12.0,
    },
    evidence: [
      'Unauthorized commercial use of Nike brand name and official swoosh in avatar',
      'Counterfeit merchant profile: liquidation pricing (85% off) typical of fake goods',
    ],
    created_at: '2026-10-11T15:40:00Z',
    updated_at: '2026-10-11T15:40:00Z',
  },
  {
    id: 'det-007-fan',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'instagram',
    title: 'Nike Fans Club Daily Inspiration',
    url: 'https://instagram.com/nike_fans_daily',
    handle_or_package: '@nike_fans_daily',
    developer_or_owner: 'Fan Community Creator',
    description: 'Daily sneaker inspirations, fit pics, and community appreciation for Nike & Jordan enthusiasts. Not affiliated with Nike, Inc.',
    logo_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120',
    risk_score: 64.0,
    risk_level: 'medium',
    status: 'reviewed',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 74.0,
      logo_similarity: 68.0,
      description_similarity: 52.0,
      lookalike_bonus: 6.0,
    },
    evidence: [
      'Contains brand name "Nike" in handle and title',
      'Explicit non-affiliation disclaimer ("Not affiliated with Nike, Inc.")',
    ],
    created_at: '2026-10-11T11:20:00Z',
    updated_at: '2026-10-11T16:10:00Z',
  },
  {
    id: 'det-010-guide',
    brand_id: brand.id,
    source_type: 'app_store',
    platform: 'app_store',
    title: 'Unofficial Companion Guide for Nike Run Club',
    url: 'https://apps.apple.com/app/unofficial-guide-for-runners/id1522819034',
    handle_or_package: 'com.runcompanion.guide',
    developer_or_owner: 'RunTech Labs',
    description: 'Pacing strategies, training schedule calculators, and community advice for users of Nike Run Club. Unofficial educational guide.',
    logo_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120',
    risk_score: 52.0,
    risk_level: 'medium',
    status: 'false_positive',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 60.0,
      logo_similarity: 45.0,
      description_similarity: 54.0,
      lookalike_bonus: 4.0,
      publisher_mismatch: {
        expected: 'Nike, Inc.',
        detected: 'RunTech Labs',
        is_mismatch: true,
        penalty: 10.0,
      },
    },
    evidence: [
      'Clear "Unofficial Companion Guide" titling',
      'App icon does not infringe on Swoosh mark',
      'Complies with Apple App Store developer trademark nominative fair use guidelines',
    ],
    created_at: '2026-10-09T09:30:00Z',
    updated_at: '2026-10-09T14:20:00Z',
  },
  {
    id: 'det-012-yt',
    brand_id: brand.id,
    source_type: 'social',
    platform: 'youtube',
    title: 'Swoosh Enthusiasts: Shoe Reviews & History',
    url: 'https://youtube.com/@swooshenthusiasts',
    handle_or_package: '@swooshenthusiasts',
    developer_or_owner: 'Marcus Bell (Shoe Collector)',
    description: 'Unboxing, teardown reviews, and sneaker history focusing on vintage running prototypes from 1970 to present day.',
    logo_url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=120',
    risk_score: 34.0,
    risk_level: 'low',
    status: 'reviewed',
    is_official_excluded: false,
    raw_signals: {
      name_similarity: 38.0,
      logo_similarity: 25.0,
      description_similarity: 32.0,
      lookalike_bonus: 0.0,
    },
    evidence: [
      'Pure editorial video critique and historical analysis',
      'No impersonation or scam indicators present',
    ],
    created_at: '2026-10-07T14:10:00Z',
    updated_at: '2026-10-07T15:00:00Z',
  },
];

// Health Check Endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/ready', (req: Request, res: Response) => {
  res.json({ status: 'ready', database: 'ok' });
});

// Auth Routes
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: 400, error_code: 'VALIDATION_ERROR', message: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(422).json({
      status: 422,
      error_code: 'VALIDATION_ERROR',
      message: 'Password must be at least 8 characters',
      details: [{ field: 'password', issue: 'Minimum 8 characters required' }]
    });
  }

  // Set user email dynamically
  user.email = email;
  if (email.includes('priya')) {
    user.full_name = 'Priya Sharma';
  }

  return res.json({
    access_token: `jwt-access-${Date.now()}-${Buffer.from(email).toString('base64')}`,
    refresh_token: `jwt-refresh-${Date.now()}-${Buffer.from(email).toString('base64')}`,
    token_type: 'bearer',
    expires_in: 3600,
  });
});

app.post('/api/v1/auth/refresh', (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(401).json({ status: 401, error_code: 'UNAUTHORIZED', message: 'Refresh token required' });
  }
  return res.json({
    access_token: `jwt-access-refreshed-${Date.now()}`,
    refresh_token: refresh_token,
    token_type: 'bearer',
    expires_in: 3600,
  });
});

app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'Successfully signed out' });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  res.json(user);
});

// Brand Routes
app.get('/api/v1/brands', (req: Request, res: Response) => {
  res.json({
    items: [{ id: brand.id, name: brand.name, logo_url: brand.logo_url, created_at: brand.created_at }],
    pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
  });
});

app.get('/api/v1/brands/:brand_id', (req: Request, res: Response) => {
  res.json({
    ...brand,
    official_social_count: officialSocials.length,
    official_app_count: officialApps.length,
  });
});

app.patch('/api/v1/brands/:brand_id', (req: Request, res: Response) => {
  const { name, website, logo_url } = req.body;
  if (name) brand.name = name;
  if (website) brand.website = website;
  if (logo_url) brand.logo_url = logo_url;
  brand.updated_at = new Date().toISOString();
  res.json(brand);
});

// Official Social Accounts
app.get('/api/v1/brands/:brand_id/social-accounts', (req: Request, res: Response) => {
  res.json(officialSocials);
});

app.post('/api/v1/brands/:brand_id/social-accounts', (req: Request, res: Response) => {
  const { platform, handle, url, is_verified } = req.body;
  const existing = officialSocials.find(
    (s) => s.platform.toLowerCase() === platform.toLowerCase() && s.handle.toLowerCase() === handle.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ status: 409, error_code: 'CONFLICT', message: 'Handle already exists for platform' });
  }

  const newSoc: SocialStore = {
    id: `soc-${Date.now()}`,
    brand_id: brand.id,
    platform,
    handle,
    url: url || `https://${platform}.com/${handle.replace('@', '')}`,
    is_verified: is_verified || false,
    created_at: new Date().toISOString(),
  };
  officialSocials.push(newSoc);
  res.status(201).json(newSoc);
});

app.delete('/api/v1/brands/:brand_id/social-accounts/:account_id', (req: Request, res: Response) => {
  officialSocials = officialSocials.filter((s) => s.id !== req.params.account_id);
  res.status(204).send();
});

// Official Apps
app.get('/api/v1/brands/:brand_id/apps', (req: Request, res: Response) => {
  res.json(officialApps);
});

app.post('/api/v1/brands/:brand_id/apps', (req: Request, res: Response) => {
  const { name, package_id, developer_name, store, store_url, logo_url } = req.body;
  const newApp: AppStoreItem = {
    id: `app-${Date.now()}`,
    brand_id: brand.id,
    name,
    package_id,
    developer_name,
    store,
    store_url,
    logo_url,
    created_at: new Date().toISOString(),
  };
  officialApps.push(newApp);
  res.status(201).json(newApp);
});

app.delete('/api/v1/brands/:brand_id/apps/:app_id', (req: Request, res: Response) => {
  officialApps = officialApps.filter((a) => a.id !== req.params.app_id);
  res.status(204).send();
});

// Detections
app.post('/api/v1/brands/:brand_id/detections/run', (req: Request, res: Response) => {
  // Simulate scan and exclude official assets
  res.status(202).json({
    job_id: `job-${Date.now()}`,
    status: 'queued',
    message: 'Detection job accepted and executed',
  });
});

app.get('/api/v1/brands/:brand_id/detections', (req: Request, res: Response) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const pageSize = parseInt((req.query.page_size as string) || '20', 10);
  const riskLevel = req.query.risk_level as string;
  const sourceType = req.query.source_type as string;
  const platform = req.query.platform as string;
  const statusFilter = req.query.status as string;

  let filtered = detections.filter((d) => !d.is_official_excluded);

  if (riskLevel) filtered = filtered.filter((d) => d.risk_level === riskLevel.toLowerCase());
  if (sourceType) filtered = filtered.filter((d) => d.source_type === sourceType.toLowerCase());
  if (platform) filtered = filtered.filter((d) => d.platform === platform.toLowerCase());
  if (statusFilter) filtered = filtered.filter((d) => d.status === statusFilter.toLowerCase());

  const summary = {
    high: detections.filter((d) => d.risk_level === 'high').length,
    medium: detections.filter((d) => d.risk_level === 'medium').length,
    low: detections.filter((d) => d.risk_level === 'low').length,
    needs_review: detections.filter((d) => d.status === 'needs_review').length,
  };

  const startIndex = (page - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);

  res.json({
    items,
    pagination: {
      page,
      page_size: pageSize,
      total_items: filtered.length,
      total_pages: Math.ceil(filtered.length / pageSize) || 1,
    },
    summary,
  });
});

app.get('/api/v1/brands/:brand_id/detections/:detection_id', (req: Request, res: Response) => {
  const det = detections.find((d) => d.id === req.params.detection_id);
  if (!det) {
    return res.status(404).json({ status: 404, error_code: 'NOT_FOUND', message: 'Detection not found' });
  }
  res.json(det);
});

app.patch('/api/v1/brands/:brand_id/detections/:detection_id', (req: Request, res: Response) => {
  const det = detections.find((d) => d.id === req.params.detection_id);
  if (!det) {
    return res.status(404).json({ status: 404, error_code: 'NOT_FOUND', message: 'Detection not found' });
  }
  const { status } = req.body;
  if (status) {
    det.status = status;
    det.updated_at = new Date().toISOString();
  }
  res.json(det);
});

app.get('/api/v1/brands/:brand_id/summary', (req: Request, res: Response) => {
  const total = detections.length;
  const high = detections.filter((d) => d.risk_level === 'high').length;
  const medium = detections.filter((d) => d.risk_level === 'medium').length;
  const low = detections.filter((d) => d.risk_level === 'low').length;
  const needs_review = detections.filter((d) => d.status === 'needs_review').length;

  const by_source = {
    social: detections.filter((d) => d.source_type === 'social').length,
    app_store: detections.filter((d) => d.source_type === 'app_store').length,
  };

  const by_platform: Record<string, number> = {};
  detections.forEach((d) => {
    by_platform[d.platform] = (by_platform[d.platform] || 0) + 1;
  });

  res.json({
    brand_id: brand.id,
    total_detections: total,
    needs_review,
    high_risk: high,
    medium_risk: medium,
    low_risk: low,
    by_source,
    by_platform,
    last_scan_at: new Date().toISOString(),
  });
});

// Mount Vite in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BrandGuard] Full-Stack server running on port ${PORT}`);
  });
}

startServer();
