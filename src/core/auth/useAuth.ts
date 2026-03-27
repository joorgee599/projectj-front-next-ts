'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/modules/auth/services/auth.service';
import { User } from '@/modules/auth/types/auth.types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setIsLoaded(true);
  }, []);

  /**
   * Checks if the user has a specific permission.
   * A user can have multiple roles with many permissions — the backend already returns
   * the full flattened set of permissions from all assigned roles.
   * We check 'permissions' only: no role-based bypass.
   */
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  /**
   * Returns true if the user has ALL of the given permissions.
   */
  const hasAllPermissions = (...permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every(p => user.permissions.includes(p));
  };

  /**
   * Returns true if the user has AT LEAST ONE of the given permissions.
   */
  const hasAnyPermission = (...permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some(p => user.permissions.includes(p));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const isAuthenticated = (): boolean => {
    return !!authService.getToken() && !!user;
  };

  return { user, isLoaded, hasPermission, hasAllPermissions, hasAnyPermission, hasRole, isAuthenticated };
}
