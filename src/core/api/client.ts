export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage (simplified for now)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  },

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      ...(body !== undefined
        ? { body: body instanceof FormData ? body : JSON.stringify(body) }
        : {}),
    });
  },

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
