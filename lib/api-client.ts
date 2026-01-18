const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw error;
  }

  return response;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name?: string) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

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

    const response = await fetch(`${API_URL}/customers/import`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw error;
    }

    return response.json();
  },
};
