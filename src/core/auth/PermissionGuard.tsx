'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/useAuth';

interface PermissionGuardProps {
  /** The permission required to access this page */
  permission: string;
  children: React.ReactNode;
}

/**
 * Wraps a page and redirects to /dashboard if the user lacks the required permission.
 * Usage: wrap the page content inside <PermissionGuard permission="MANAGE_USERS">
 */
export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { isLoaded, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !hasPermission(permission)) {
      router.replace('/dashboard');
    }
  }, [isLoaded, permission, hasPermission, router]);

  if (!isLoaded) return null;
  if (!hasPermission(permission)) return null;

  return <>{children}</>;
}
