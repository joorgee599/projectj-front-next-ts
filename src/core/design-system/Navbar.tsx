'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  Menu, 
  PlusCircle, 
  Bell, 
  MessageSquare, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSelector } from './LanguageSelector';
import styles from './Navbar.module.css';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName,
  onLogout,
  onMenuToggle 
}) => {
  const router = useRouter();
  const t = useTranslations('navbar');
  const tCommon = useTranslations('common');
  const finalUserName = userName || tCommon('user');
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
        <Menu size={24} />
      </button>

      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder={t('search')}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.quickActions}>
        <button className={`${styles.quickActionBtn} ${styles.primary}`}>
          <PlusCircle size={18} />
          <span>{t('new')}</span>
        </button>
      </div>

      <div className={styles.navActions}>
        <button className={styles.actionButton} aria-label={t('notifications')}>
          <Bell size={20} />
          <span className={styles.notificationBadge}></span>
        </button>

        <button className={styles.actionButton} aria-label={t('messages')}>
          <MessageSquare size={20} />
        </button>

        <div className={styles.divider}></div>

        <ThemeToggle />
        
        <LanguageSelector />

        <div className={styles.divider}></div>

        <div className={styles.userMenuWrapper} ref={dropdownRef}>
          <button 
            className={styles.userButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.userAvatar}>
              {finalUserName.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{finalUserName}</div>
              <div className={styles.userStatus}>{t('online')}</div>
            </div>
            <ChevronDown className={styles.dropdownIcon} size={16} />
          </button>

          {isDropdownOpen && (
            <div className={styles.userDropdown}>
              <button 
                className={styles.dropdownItem}
                onClick={handleProfileClick}
              >
                <User size={16} className={styles.dropdownItemIcon} />
                <span>{t('profile')}</span>
              </button>
              
              <div className={styles.dropdownDivider}></div>
              
              <button 
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogoutClick}
              >
                <LogOut size={16} className={styles.dropdownItemIcon} />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
