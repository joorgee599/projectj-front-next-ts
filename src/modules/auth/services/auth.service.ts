import { apiClient } from '@/core/api/client';
import { AuthResponse, LoginRequest, LogoutResponse, User } from '../types/auth.types';

const isBrowser = () => typeof window !== 'undefined';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.token && isBrowser()) {
      localStorage.setItem('auth_token', response.token);
      
      const user: User = {
        email: response.email,
        roles: response.roles,
        permissions: response.permissions
      };
      
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    
    return response;
  },

  async logout(): Promise<LogoutResponse> {
    try {
      // Llamar al backend para invalidar el token
      const response = await apiClient.post<LogoutResponse>('/auth/logout', {});
      
      // Limpiar localStorage
      if (isBrowser()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      
      return response;
    } catch (error) {
      // Aunque falle el backend, limpiamos localStorage
      if (isBrowser()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      
      throw error;
    }
  },

  getCurrentUser(): User | null {
    if (!isBrowser()) return null;
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
  
  getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem('auth_token');
  }
};
