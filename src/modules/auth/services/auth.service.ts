import { apiClient } from '@/core/api/client';
import { AuthResponse, LoginRequest, LogoutResponse, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.token) {
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      return response;
    } catch (error) {
      // Aunque falle el backend, limpiamos localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      throw error;
    }
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};
