import { createClient } from './supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Get Supabase access token for API requests
async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw error;
  }

  return response;
}

// Note: Auth is now handled by Supabase directly
// Login/Register pages will use Supabase client methods
// These exports are kept for compatibility but will be removed
export const authApi = {
  login: async () => {
    throw new Error('Use Supabase auth directly. See login page for example.');
  },

  register: async () => {
    throw new Error('Use Supabase auth directly. See register page for example.');
  },

  logout: async () => {
    throw new Error('Use Supabase auth directly. See auth-context.tsx for example.');
  },

  getMe: async () => {
    throw new Error('Use Supabase auth directly. See auth-context.tsx for example.');
  },
};

// Customers API - now uses Supabase access token
export const customersApi = {
  list: (search: string, page: number, limit: number) =>
    apiRequest(`/customers?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`),

  get: (id: string) =>
    apiRequest(`/customers/${id}`),

  create: (data: {
    name: string;
    account_number: string;
    phone: string;
    nominee?: string;
    nid?: string;
    status?: 'active' | 'inactive' | 'lead';
    notes?: string;
    photo?: string;
  }) =>
    apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: {
    name?: string;
    account_number?: string;
    phone?: string;
    nominee?: string;
    nid?: string;
    status?: 'active' | 'inactive' | 'lead';
    notes?: string;
    photo?: string;
  }) =>
    apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    }),

  import: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/customers/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw error;
    }

    return response.json();
  },
};
