'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { authService } from '@/modules/auth/services/auth.service';
import styles from './page.module.css';

export default function ProfilePage() {
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
          <h1>👤 Mi Perfil</h1>
          <p>Administra tu información personal y preferencias</p>
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
                  <div className={styles.avatarBadge}>✓</div>
                </div>
                <h2 className={styles.profileName}>
                  {user?.email?.split('@')[0] || 'Usuario'}
                </h2>
                <p className={styles.profileEmail}>
                  {user?.email || 'usuario@example.com'}
                </p>
                <span className={styles.profileRole}>
                  {user?.roles?.[0] || 'Usuario'}
                </span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <h3>📊 Estadísticas</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Días activo</span>
                <span className={styles.statValue}>45</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Sesiones</span>
                <span className={styles.statValue}>128</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Acciones</span>
                <span className={styles.statValue}>342</span>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className={styles.profileContent}>
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Información Personal</h3>
                <button className={styles.editButton}>✏️ Editar</button>
              </div>

              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Nombre completo</span>
                  <span className={styles.infoValue}>
                    {user?.email?.split('@')[0] || 'No especificado'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>
                    {user?.email || 'No especificado'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>+1 (555) 123-4567</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ubicación</span>
                  <span className={styles.infoValue}>San Francisco, CA</span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Rol</span>
                  <span className={styles.infoValue}>
                    {user?.roles?.join(', ') || 'Usuario'}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha de registro</span>
                  <span className={styles.infoValue}>15 Mar 2026</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Permisos</h3>
              </div>

              <div className={styles.infoGrid}>
                {user?.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((permission: string, index: number) => (
                    <div key={index} className={styles.infoItem}>
                      <span className={styles.infoValue}>✓ {permission}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.infoItem}>
                    <span className={styles.infoValue}>Sin permisos asignados</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Actividad Reciente</h3>
              </div>

              <div className={styles.activityList}>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>🔐</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Inicio de sesión exitoso</div>
                    <div className={styles.activityTime}>Hoy a las 10:30 AM</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>📝</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Perfil actualizado</div>
                    <div className={styles.activityTime}>Hace 2 días</div>
                  </div>
                </div>

                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>🔔</div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityTitle}>Preferencias de notificaciones cambiadas</div>
                    <div className={styles.activityTime}>Hace 5 días</div>
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
