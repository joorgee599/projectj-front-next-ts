import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  BarChart, 
  FileText, 
  Package, 
  Tags, 
  Factory, 
  Truck, 
  Users, 
  User, 
  Shield, 
  Key, 
  UserPlus, 
  ShoppingCart, 
  UserCircle, 
  Settings, 
  Plug, 
  Lock,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Warehouse
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  /** If set, the item is only visible when the user has this permission */
  requiredPermission?: string;
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
  /** Full list of permission strings from the logged-in user */
  userPermissions?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  userName,
  userRole,
  userPermissions = [],
}) => {
  const pathname = usePathname();
  const t = useTranslations('sidebar');
  const tCommon = useTranslations('common');
  const finalUserName = userName || tCommon('user');
  const finalUserRole = userRole || tCommon('administrator');
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  /** Returns true if the user can see this nav item */
  const canSee = (item: NavItem): boolean => {
    if (!item.requiredPermission) return true;
    return userPermissions.includes(item.requiredPermission);
  };

  const navSections: NavSection[] = [
    {
      title: t('principal'),
      items: [
        { label: t('dashboard'), icon: <LayoutDashboard size={20} />, href: '/dashboard' },
        { label: t('analytics'), icon: <BarChart size={20} />, href: '/dashboard/analytics' },
        { label: t('reports'), icon: <FileText size={20} />, href: '/dashboard/reports' },
      ],
    },
    {
      title: t('management'),
      items: [
        { 
          label: t('productManagement'), 
          icon: <Package size={20} />, 
          href: '/dashboard/products',
          requiredPermission: 'READ_PRODUCTS',
          subItems: [
            { label: t('products'), icon: <Package size={18} />, href: '/dashboard/products', badge: '12', requiredPermission: 'READ_PRODUCTS' },
            { label: t('categories'), icon: <Tags size={18} />, href: '/dashboard/categories', requiredPermission: 'READ_CATEGORIES' },
            { label: t('brands'), icon: <Factory size={18} />, href: '/dashboard/brands', requiredPermission: 'READ_BRANDS' },
            { label: t('providers'), icon: <Truck size={18} />, href: '/dashboard/providers', requiredPermission: 'READ_PROVIDERS' },
            { label: t('inventory'), icon: <Warehouse size={18} />, href: '/dashboard/inventory', requiredPermission: 'READ_INVENTORY' },
          ]
        },
        { 
          label: t('userManagement'), 
          icon: <Users size={20} />, 
          href: '/dashboard/users',
          requiredPermission: 'READ_USERS',
          subItems: [
            { label: t('users'), icon: <User size={18} />, href: '/dashboard/users', requiredPermission: 'READ_USERS' },
            { label: t('roles'), icon: <Shield size={18} />, href: '/dashboard/roles', requiredPermission: 'READ_ROLES' },
            { label: t('permissions'), icon: <Key size={18} />, href: '/dashboard/permissions', requiredPermission: 'READ_PERMISSIONS' },
            { label: t('clients'), icon: <UserPlus size={18} />, href: '/dashboard/clients', requiredPermission: 'READ_CLIENTS' },
          ]
        },
        {
          label: t('salesManagement'),
          icon: <ShoppingCart size={20} />,
          href: '/dashboard/orders',
          requiredPermission: 'READ_SALES',
          subItems: [
            { label: t('orders'), icon: <ShoppingCart size={18} />, href: '/dashboard/orders', badge: '3', requiredPermission: 'READ_SALES' },
            { label: t('myCart'), icon: <ShoppingCart size={18} />, href: '/dashboard/cart' },
          ]
        },
      ],
    },
    {
      title: t('configuration'),
      items: [
        { label: t('myProfile'), icon: <UserCircle size={20} />, href: '/dashboard/profile' },
        { label: t('settings'), icon: <Settings size={20} />, href: '/dashboard/settings' },
        { label: t('integrations'), icon: <Plug size={20} />, href: '/dashboard/integrations' },
        { label: t('security'), icon: <Lock size={20} />, href: '/dashboard/security' },
      ],
    },
  ];

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
        {navSections.map((section) => {
          const visibleItems = section.items.filter(canSee);
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.title} className={styles.navSection}>
            <div className={styles.navTitle}>{section.title}</div>
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              const isExpanded = expandedItems.has(item.label);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const visibleSubItems = hasSubItems ? item.subItems!.filter(canSee) : [];
              const isSubItemActive = visibleSubItems.some(sub => pathname === sub.href);

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
                        <span className={styles.expandIcon}>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                      </div>
                      {isExpanded && !isCollapsed && (
                        <div className={styles.subItems}>
                          {visibleSubItems.map((subItem) => {
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
                      {isCollapsed && visibleSubItems.length > 0 && (
                        <div className={styles.popupMenu}>
                          <div className={styles.popupHeader}>{item.label}</div>
                          {visibleSubItems.map((subItem) => {
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
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {finalUserName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{finalUserName}</div>
            <div className={styles.userRole}>{finalUserRole}</div>
          </div>
        </div>
      </div>

      <button 
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={isCollapsed ? tCommon('expand') : tCommon('collapse')}
      >
        {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>
    </aside>
  );
};
