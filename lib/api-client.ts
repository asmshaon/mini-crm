const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
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

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  register: async (email: string, password: string, name?: string) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: async () => {
    removeToken();
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    return response.json();
  },

  getMe: () =>
    apiRequest('/auth/me'),
};

// Customers API
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

    const token = getToken();
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
