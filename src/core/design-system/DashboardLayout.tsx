'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { authService } from '@/modules/auth/services/auth.service';
import { User } from '@/modules/auth/types/auth.types';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Usuario');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();

    if (!token || !user) {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setUserName(user.email.split('@')[0]);
    setIsAuthChecked(true);
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/login');
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!isAuthChecked) return null;

  const userRoleLabel = currentUser?.roles?.join(', ') || 'Usuario';

  return (
    <div className={styles.layout}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        isMobileOpen={isMobileMenuOpen}
        userName={userName}
        userRole={userRoleLabel}
        userPermissions={currentUser?.permissions || []}
      />

      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <Navbar
          userName={userName}
          onLogout={handleLogout}
          onMenuToggle={handleMobileMenuToggle}
        />

        <main className={styles.content}>
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
