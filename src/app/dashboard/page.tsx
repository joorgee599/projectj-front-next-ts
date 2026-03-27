'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import styles from './page.module.css';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  return (
    <DashboardLayout>
      <div className={styles.dashboardContent}>
        <div className={styles.welcomeSection}>
          <h1>👋 {t('welcome')}</h1>
          <p>{t('subtitle')}</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                📊
              </div>
              <span className={styles.statTitle}>{t('totalSales')}</span>
            </div>
            <div className={styles.statValue}>$24,500</div>
            <div className={styles.statChange}>+12.5% {t('vsPreviousMonth')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                👥
              </div>
              <span className={styles.statTitle}>{t('activeUsers')}</span>
            </div>
            <div className={styles.statValue}>1,248</div>
            <div className={styles.statChange}>+8.2% {t('vsPreviousMonth')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.purple}`}>
                📦
              </div>
              <span className={styles.statTitle}>{t('products')}</span>
            </div>
            <div className={styles.statValue}>342</div>
            <div className={styles.statChange}>+5 {t('newThisWeek')}</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                ⭐
              </div>
              <span className={styles.statTitle}>{t('satisfaction')}</span>
            </div>
            <div className={styles.statValue}>4.8/5</div>
            <div className={styles.statChange}>+0.3 {t('vsPreviousMonth')}</div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
            
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🛒</div>
              <div className={styles.activityContent}>
                <h4>Nueva orden recibida</h4>
                <p>Orden #12345 por $125.00 - Hace 5 minutos</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>👤</div>
              <div className={styles.activityContent}>
                <h4>Nuevo usuario registrado</h4>
                <p>Juan Pérez se registró - Hace 15 minutos</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>📦</div>
              <div className={styles.activityContent}>
                <h4>Producto actualizado</h4>
                <p>Laptop HP actualizado - Hace 1 hora</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>💬</div>
              <div className={styles.activityContent}>
                <h4>Nueva reseña</h4>
                <p>5 estrellas en "Mouse Logitech" - Hace 2 horas</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebarContent}>
            <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
            
            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>➕</div>
              <span className={styles.actionText}>Agregar Producto</span>
            </div>

            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>👥</div>
              <span className={styles.actionText}>Ver Usuarios</span>
            </div>

            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>📊</div>
              <span className={styles.actionText}>Generar Reporte</span>
            </div>

            <div className={styles.quickAction}>
              <div className={styles.actionIcon}>⚙️</div>
              <span className={styles.actionText}>Configuración</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
