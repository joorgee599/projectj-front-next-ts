'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: string;
  subItems?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  userName?: string;
  userRole?: string;
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: '📊', href: '/dashboard' },
      { label: 'Análisis', icon: '📈', href: '/dashboard/analytics' },
      { label: 'Reportes', icon: '📋', href: '/dashboard/reports' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { 
        label: 'Gestión de Productos', 
        icon: '📦', 
        href: '/dashboard/products',
        subItems: [
          { label: 'Productos', icon: '📦', href: '/dashboard/products', badge: '12' },
          { label: 'Categorías', icon: '🏷️', href: '/dashboard/categories' },
          { label: 'Marcas', icon: '🏭', href: '/dashboard/brands' },
        ]
      },
      { label: 'Proveedores', icon: '🚚', href: '/dashboard/providers' },
      { label: 'Usuarios', icon: '👥', href: '/dashboard/users' },
      { label: 'Órdenes', icon: '🛒', href: '/dashboard/orders', badge: '3' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Mi Perfil', icon: '👤', href: '/dashboard/profile' },
      { label: 'Ajustes', icon: '⚙️', href: '/dashboard/settings' },
      { label: 'Integraciones', icon: '🔌', href: '/dashboard/integrations' },
      { label: 'Seguridad', icon: '🔒', href: '/dashboard/security' },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  userName = 'Usuario',
  userRole = 'Administrador',
}) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpand = (label: string) => {
    // If sidebar is collapsed, expand it first
    if (isCollapsed) {
      onToggle();
      // Auto-expand the clicked item after sidebar opens
      setTimeout(() => {
        setExpandedItems(prev => new Set(prev).add(label));
      }, 100);
    } else {
      // Normal toggle behavior when sidebar is open
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(label)) {
          newSet.delete(label);
        } else {
          newSet.add(label);
        }
        return newSet;
      });
    }
  };

  return (
    <aside 
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.open : ''}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>P</div>
        <span className={styles.brandName}>ProjectJ</span>
      </div>

      <nav className={styles.sidebarNav}>
        {navSections.map((section) => (
          <div key={section.title} className={styles.navSection}>
            <div className={styles.navTitle}>{section.title}</div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const isExpanded = expandedItems.has(item.label);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isSubItemActive = hasSubItems && item.subItems.some(sub => pathname === sub.href);

              return (
                <div key={item.label} className={styles.navItemWrapper}>
                  {hasSubItems ? (
                    <>
                      <div
                        className={`${styles.navItem} ${isSubItemActive ? styles.active : ''} ${hasSubItems ? styles.hasSubItems : ''}`}
                        onClick={() => toggleExpand(item.label)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className={styles.navIcon}>{item.icon}</span>
                        <span className={styles.navText}>{item.label}</span>
                        <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                      </div>
                      {isExpanded && !isCollapsed && (
                        <div className={styles.subItems}>
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`${styles.navItem} ${styles.subItem} ${isSubActive ? styles.active : ''}`}
                              >
                                <span className={styles.navIcon}>{subItem.icon}</span>
                                <span className={styles.navText}>{subItem.label}</span>
                                {subItem.badge && <span className={styles.badge}>{subItem.badge}</span>}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      {/* Popup menu for collapsed sidebar */}
                      {isCollapsed && hasSubItems && (
                        <div className={styles.popupMenu}>
                          <div className={styles.popupHeader}>{item.label}</div>
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`${styles.popupItem} ${isSubActive ? styles.active : ''}`}
                              >
                                <span className={styles.navIcon}>{subItem.icon}</span>
                                <span>{subItem.label}</span>
                                {subItem.badge && <span className={styles.badge}>{subItem.badge}</span>}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navText}>{item.label}</span>
                      {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userRole}>{userRole}</div>
          </div>
        </div>
      </div>

      <button 
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>
    </aside>
  );
};
