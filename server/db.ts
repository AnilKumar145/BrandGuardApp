import { BrandProfile, Detection, User } from '../src/types';
import { initialBrandProfile, initialDetections, mockCurrentUser } from '../src/data/mockData';

// Data repository for the BrandGuard backend
export interface DbStore {
  user: User;
  brands: Map<string, BrandProfile>;
  detections: Map<string, Detection>;
}

class Database {
  private user: User = { ...mockCurrentUser };
  private brands: Map<string, BrandProfile> = new Map();
  private detections: Map<string, Detection> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // Seed initial Nike brand
    this.brands.set(initialBrandProfile.id, JSON.parse(JSON.stringify(initialBrandProfile)));

    // Seed initial detections
    initialDetections.forEach((det) => {
      this.detections.set(det.id, JSON.parse(JSON.stringify(det)));
    });
  }

  public getUser(): User {
    return this.user;
  }

  public getBrand(id: string): BrandProfile | undefined {
    return this.brands.get(id);
  }

  public getAllBrands(): BrandProfile[] {
    return Array.from(this.brands.values());
  }

  public updateBrand(id: string, updates: Partial<BrandProfile>): BrandProfile | undefined {
    const brand = this.brands.get(id);
    if (!brand) return undefined;
    const updated = {
      ...brand,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.brands.set(id, updated);
    return updated;
  }

  public createBrand(data: Omit<BrandProfile, 'id' | 'lastScanAt' | 'updatedAt' | 'officialSocialAccounts' | 'officialApps'>): BrandProfile {
    const newId = `brd-${Date.now()}`;
    const newBrand: BrandProfile = {
      ...data,
      id: newId,
      officialSocialAccounts: [],
      officialApps: [],
      lastScanAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.brands.set(newId, newBrand);
    return newBrand;
  }

  public deleteBrand(id: string): boolean {
    return this.brands.delete(id);
  }

  public getDetectionsByBrand(brandId: string): Detection[] {
    return Array.from(this.detections.values()).filter((d) => d.brandId === brandId);
  }

  public getDetectionById(id: string): Detection | undefined {
    return this.detections.get(id);
  }

  public addDetection(detection: Detection) {
    this.detections.set(detection.id, detection);
  }

  public updateDetection(id: string, updates: Partial<Detection>): Detection | undefined {
    const current = this.detections.get(id);
    if (!current) return undefined;
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.detections.set(id, updated);
    return updated;
  }

  public reset() {
    this.brands.clear();
    this.detections.clear();
    this.seed();
  }
}

export const db = new Database();
