'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { authService } from '@/modules/auth/services/auth.service';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar, 
  BarChart3, 
  Lock, 
  FileEdit, 
  Bell,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import styles from './page.module.css';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tUsers = useTranslations('users');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <h1><UserIcon className={styles.headerIcon} /> {t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        <div className={styles.profileGrid}>
          {/* Sidebar */}
          <div className={styles.profileSidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className={styles.avatarBadge}><CheckCircle2 size={16} /></div>
                </div>
                <h2 className={styles.profileName}>
                  {user?.email?.split('@')[0] || tUsers('roleUser')}
                </h2>
                <p className={styles.profileEmail}>
                  {user?.email || 'user@example.com'}
                </p>
                <span className={styles.profileRole}>
                  {user?.roles?.[0] || tUsers('roleUser')}
                </span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <h3><BarChart3 size={18} /> {t('statistics')}</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('daysActive')}</span>
                <span className={styles.statValue}>45</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('sessions')}</span>
                <span className={styles.statValue}>128</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>{t('actions')}</span>
                <span className={styles.statValue}>342</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.profileContent}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{t('information')}</h3>
                <button className={styles.editButton}>
                  <Edit2 size={16} /> {tCommon('edit')}
                </button>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><UserIcon size={14} /> {t('name')}</span>
                  <span className={styles.infoValue}>
                    {user?.email?.split('@')[0] || t('notSpecified')}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><Mail size={14} /> {t('email')}</span>
                  <span className={styles.infoValue}>
                    {user?.email || t('notSpecified')}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><Phone size={14} /> {t('phone')}</span>
                  <span className={styles.infoValue}>+1 (555) 123-4567</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><MapPin size={14} /> {t('location')}</span>
                  <span className={styles.infoValue}>San Francisco, CA</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><Shield size={14} /> {t('role')}</span>
                  <span className={styles.infoValue}>
                    {user?.roles?.join(', ') || tUsers('roleUser')}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}><Calendar size={14} /> {t('joinDate')}</span>
                  <span className={styles.infoValue}>15 Mar 2026</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{t('permissions')}</h3>
              </div>

              <div className={styles.infoGrid}>
                {user?.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((permission: string, index: number) => (
                    <div key={index} className={styles.infoItem}>
                      <span className={styles.infoValue}><Shield size={14} className={styles.permIcon} /> {permission}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.infoItem}>
                    <span className={styles.infoValue}>{t('noPermissions')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{t('recentActivity')}</h3>
              </div>

              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}><Lock size={18} /></div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{t('successfulLogin')}</div>
                    <div className={styles.activityTime}>{t('todayAt')} 10:30 AM</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}><FileEdit size={18} /></div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{t('profileUpdated')}</div>
                    <div className={styles.activityTime}>{t('daysAgo', { count: 2 })}</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}><Bell size={18} /></div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>{t('notifPrefChanged')}</div>
                    <div className={styles.activityTime}>{t('daysAgo', { count: 5 })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
