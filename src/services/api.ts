/**
 * BrandGuard API Client
 * Fully typed client communicating with /api/v1 endpoints
 */

const API_BASE_URL = '/api/v1';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserMe {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('brandguard_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error_code || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const data = await request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      localStorage.setItem('brandguard_access_token', data.access_token);
      localStorage.setItem('brandguard_refresh_token', data.refresh_token);
    }
    return data;
  },

  getMe: async (): Promise<UserMe> => {
    return request<UserMe>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await request<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('brandguard_access_token');
    localStorage.removeItem('brandguard_refresh_token');
  },

  refreshToken: async (): Promise<AuthTokens> => {
    const refresh_token = localStorage.getItem('brandguard_refresh_token');
    if (!refresh_token) throw new Error('No refresh token available');
    const data = await request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
    if (data.access_token) {
      localStorage.setItem('brandguard_access_token', data.access_token);
    }
    return data;
  },

  // Brands
  getBrands: async (page = 1, page_size = 20) => {
    return request<any>(`/brands?page=${page}&page_size=${page_size}`);
  },

  getBrand: async (brandId: string) => {
    return request<any>(`/brands/${brandId}`);
  },

  updateBrand: async (brandId: string, data: { name?: string; website?: string; logo_url?: string }) => {
    return request<any>(`/brands/${brandId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Official Social Accounts
  getSocialAccounts: async (brandId: string) => {
    return request<any[]>(`/brands/${brandId}/social-accounts`);
  },

  addSocialAccount: async (brandId: string, data: { platform: string; handle: string; url?: string; is_verified?: boolean }) => {
    return request<any>(`/brands/${brandId}/social-accounts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteSocialAccount: async (brandId: string, accountId: string) => {
    return request<void>(`/brands/${brandId}/social-accounts/${accountId}`, {
      method: 'DELETE',
    });
  },

  // Official Apps
  getApps: async (brandId: string) => {
    return request<any[]>(`/brands/${brandId}/apps`);
  },

  addApp: async (brandId: string, data: { name: string; store: string; developer_name: string; package_id?: string; store_url?: string; logo_url?: string }) => {
    return request<any>(`/brands/${brandId}/apps`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteApp: async (brandId: string, appId: string) => {
    return request<void>(`/brands/${brandId}/apps/${appId}`, {
      method: 'DELETE',
    });
  },

  // Detections
  getDetections: async (
    brandId: string,
    params: {
      page?: number;
      page_size?: number;
      risk_level?: string;
      source_type?: string;
      platform?: string;
      status?: string;
      min_score?: number;
      sort_by?: string;
      sort_order?: string;
    } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.page_size) query.set('page_size', params.page_size.toString());
    if (params.risk_level && params.risk_level !== 'all') query.set('risk_level', params.risk_level);
    if (params.source_type && params.source_type !== 'all') query.set('source_type', params.source_type);
    if (params.platform) query.set('platform', params.platform);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.min_score) query.set('min_score', params.min_score.toString());
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    return request<any>(`/brands/${brandId}/detections?${query.toString()}`);
  },

  getDetectionDetail: async (brandId: string, detectionId: string) => {
    return request<any>(`/brands/${brandId}/detections/${detectionId}`);
  },

  updateDetectionStatus: async (brandId: string, detectionId: string, status: string) => {
    return request<any>(`/brands/${brandId}/detections/${detectionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  runDetection: async (brandId: string, sources = ['social', 'app_store']) => {
    return request<any>(`/brands/${brandId}/detections/run`, {
      method: 'POST',
      body: JSON.stringify({ sources, force_refresh: true }),
    });
  },

  getBrandSummary: async (brandId: string) => {
    return request<any>(`/brands/${brandId}/summary`);
  },
};
