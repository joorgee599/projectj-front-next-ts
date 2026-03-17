'use client';

import React from 'react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { ChatWidget } from '@/modules/chat/components/ChatWidget';
import styles from './page.module.css';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className={styles.dashboardContent}>
        <div className={styles.welcomeSection}>
          <h1>¡Bienvenido de nuevo! 👋</h1>
          <p>Aquí está un resumen de tu actividad</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                📊
              </div>
              <span className={styles.statTitle}>Total de Ventas</span>
            </div>
            <div className={styles.statValue}>$24,500</div>
            <div className={styles.statChange}>+12.5% vs mes anterior</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                👥
              </div>
              <span className={styles.statTitle}>Usuarios Activos</span>
            </div>
            <div className={styles.statValue}>1,248</div>
            <div className={styles.statChange}>+8.2% vs mes anterior</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.purple}`}>
                📦
              </div>
              <span className={styles.statTitle}>Productos</span>
            </div>
            <div className={styles.statValue}>342</div>
            <div className={styles.statChange}>+5 nuevos esta semana</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                ⭐
              </div>
              <span className={styles.statTitle}>Satisfacción</span>
            </div>
            <div className={styles.statValue}>4.8/5</div>
            <div className={styles.statChange}>+0.3 vs mes anterior</div>
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

        {/* Chat Widget flotante */}
        <ChatWidget />
      </div>
    </DashboardLayout>
  );
}
