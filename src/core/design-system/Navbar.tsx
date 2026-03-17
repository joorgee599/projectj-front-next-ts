'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'Usuario',
  onLogout,
  onMenuToggle 
}) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    router.push('/dashboard/profile');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  return (
    <nav className={styles.navbar}>
      <button 
        className={styles.mobileMenuButton}
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Buscar productos, usuarios, órdenes..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.quickActions}>
        <button className={`${styles.quickActionBtn} ${styles.primary}`}>
          <span>➕</span>
          <span>Nuevo</span>
        </button>
      </div>

      <div className={styles.navActions}>
        <button className={styles.actionButton} aria-label="Notificaciones">
          🔔
          <span className={styles.notificationBadge}></span>
        </button>

        <button className={styles.actionButton} aria-label="Mensajes">
          💬
        </button>

        <div className={styles.divider}></div>

        <div className={styles.userMenuWrapper} ref={dropdownRef}>
          <button 
            className={styles.userButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.userAvatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userStatus}>En línea</div>
            </div>
            <span className={styles.dropdownIcon}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className={styles.userDropdown}>
              <button 
                className={styles.dropdownItem}
                onClick={handleProfileClick}
              >
                <span className={styles.dropdownItemIcon}>👤</span>
                <span>Mi Perfil</span>
              </button>
              
              <div className={styles.dropdownDivider}></div>
              
              <button 
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogoutClick}
              >
                <span className={styles.dropdownItemIcon}>🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
