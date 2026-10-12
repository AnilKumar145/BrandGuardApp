import { Router, Request, Response } from 'express';
import { db } from '../db';
import { OfficialSocialAccount, OfficialApp } from '../../src/types';

const router = Router();

// GET /api/v1/brands
router.get('/', (req: Request, res: Response) => {
  const brands = db.getAllBrands();
  res.json({
    items: brands.map((b) => ({
      id: b.id,
      name: b.name,
      logo_url: b.logoUrl,
      website: b.website,
      official_social_count: b.officialSocialAccounts.length,
      official_app_count: b.officialApps.length,
      created_at: b.updatedAt,
    })),
    pagination: {
      page: 1,
      page_size: 20,
      total_items: brands.length,
      total_pages: 1,
    },
  });
});

// POST /api/v1/brands
router.post('/', (req: Request, res: Response) => {
  const { name, website, logo_url, description } = req.body;
  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      status: 400,
      error_code: 'VALIDATION_ERROR',
      message: 'Name must be at least 2 characters',
      details: [{ field: 'name', issue: 'Field required' }],
      timestamp: new Date().toISOString(),
    });
  }

  const brand = db.createBrand({
    name: name.trim(),
    normalizedName: name.trim().toLowerCase(),
    website: website || '',
    logoUrl: logo_url || '',
    description: description || '',
  });

  res.status(201).json(brand);
});

// GET /api/v1/brands/:brand_id
router.get('/:brand_id', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: `Brand with ID ${req.params.brand_id} not found`,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({
    id: brand.id,
    name: brand.name,
    normalized_name: brand.normalizedName,
    website: brand.website,
    logo_url: brand.logoUrl,
    description: brand.description,
    official_social_count: brand.officialSocialAccounts.length,
    official_app_count: brand.officialApps.length,
    official_social_accounts: brand.officialSocialAccounts,
    official_apps: brand.officialApps,
    created_at: brand.updatedAt,
    updated_at: brand.updatedAt,
  });
});

// PATCH /api/v1/brands/:brand_id
router.patch('/:brand_id', (req: Request, res: Response) => {
  const { name, website, logo_url, description } = req.body;
  const updates: any = {};
  if (name !== undefined) {
    updates.name = name;
    updates.normalizedName = name.toLowerCase();
  }
  if (website !== undefined) updates.website = website;
  if (logo_url !== undefined) updates.logoUrl = logo_url;
  if (description !== undefined) updates.description = description;

  const updated = db.updateBrand(req.params.brand_id, updates);
  if (!updated) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }

  res.json(updated);
});

// DELETE /api/v1/brands/:brand_id
router.delete('/:brand_id', (req: Request, res: Response) => {
  const success = db.deleteBrand(req.params.brand_id);
  if (!success) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }
  res.status(204).send();
});

// --- Official Social Accounts ---

// POST /api/v1/brands/:brand_id/social-accounts
router.post('/:brand_id/social-accounts', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }

  const { platform, handle, url, is_verified } = req.body;
  if (!platform || !handle) {
    return res.status(400).json({
      status: 400,
      error_code: 'VALIDATION_ERROR',
      message: 'Platform and handle are required',
      timestamp: new Date().toISOString(),
    });
  }

  // Conflict check: 409 Conflict if duplicate
  const exists = brand.officialSocialAccounts.some(
    (a) => a.platform === platform && a.handle.toLowerCase() === handle.toLowerCase()
  );
  if (exists) {
    return res.status(409).json({
      status: 409,
      error_code: 'CONFLICT',
      message: `Social account with handle ${handle} on platform ${platform} already exists`,
      timestamp: new Date().toISOString(),
    });
  }

  const newAccount: OfficialSocialAccount = {
    id: `soc-${Date.now()}`,
    platform,
    handle: handle.startsWith('@') ? handle : `@${handle}`,
    url: url || `https://${platform}.com/${handle.replace('@', '')}`,
    isVerified: is_verified !== undefined ? !!is_verified : true,
    addedAt: new Date().toISOString(),
  };

  brand.officialSocialAccounts.push(newAccount);
  db.updateBrand(brand.id, { officialSocialAccounts: brand.officialSocialAccounts });

  res.status(201).json(newAccount);
});

// GET /api/v1/brands/:brand_id/social-accounts
router.get('/:brand_id/social-accounts', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }
  res.json(brand.officialSocialAccounts);
});

// DELETE /api/v1/brands/:brand_id/social-accounts/:account_id
router.delete('/:brand_id/social-accounts/:account_id', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }

  const filtered = brand.officialSocialAccounts.filter((a) => a.id !== req.params.account_id);
  db.updateBrand(brand.id, { officialSocialAccounts: filtered });
  res.status(204).send();
});

// --- Official Apps ---

// POST /api/v1/brands/:brand_id/apps
router.post('/:brand_id/apps', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }

  const { name, store, developer_name, package_id, store_url, logo_url } = req.body;
  if (!name || !store || !developer_name) {
    return res.status(400).json({
      status: 400,
      error_code: 'VALIDATION_ERROR',
      message: 'Name, store, and developer_name are required',
      timestamp: new Date().toISOString(),
    });
  }

  const newApp: OfficialApp = {
    id: `app-${Date.now()}`,
    name,
    store,
    developerName: developer_name,
    packageId: package_id || '',
    storeUrl: store_url || '',
    logoUrl: logo_url || brand.logoUrl,
    addedAt: new Date().toISOString(),
  };

  brand.officialApps.push(newApp);
  db.updateBrand(brand.id, { officialApps: brand.officialApps });

  res.status(201).json(newApp);
});

// GET /api/v1/brands/:brand_id/apps
router.get('/:brand_id/apps', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }
  res.json(brand.officialApps);
});

// DELETE /api/v1/brands/:brand_id/apps/:app_id
router.delete('/:brand_id/apps/:app_id', (req: Request, res: Response) => {
  const brand = db.getBrand(req.params.brand_id);
  if (!brand) {
    return res.status(404).json({
      status: 404,
      error_code: 'NOT_FOUND',
      message: 'Brand not found',
      timestamp: new Date().toISOString(),
    });
  }

  const filtered = brand.officialApps.filter((a) => a.id !== req.params.app_id);
  db.updateBrand(brand.id, { officialApps: filtered });
  res.status(204).send();
});

export default router;
