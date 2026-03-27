'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  Key, 
  Plus, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { PermissionGuard } from '@/core/auth/PermissionGuard';
import { useAuth } from '@/core/auth/useAuth';
import { PermissionModal } from '@/modules/permissions/components/PermissionModal';
import { permissionService } from '@/modules/permissions/services/permission.service';
import { Permission, PermissionRequest } from '@/modules/permissions/types/permission.types';
import styles from './page.module.css';

export default function PermissionsPage() {
  const t = useTranslations('permissions');
  const tCommon = useTranslations('common');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await permissionService.getAll();
      setPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorLoading'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsModalOpen(true);
  };

  const handleSubmit = async (permissionData: PermissionRequest) => {
    try {
      if (selectedPermission) {
        await permissionService.update(selectedPermission.id, permissionData);
        Swal.fire({
          title: tCommon('confirm'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await permissionService.create(permissionData);
        Swal.fire({
          title: tCommon('confirm'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadPermissions();
    } catch (error) {
      console.error('Error saving permission:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorSaving'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t('deleteConfirm'),
      text: t('deleteText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: tCommon('yes'),
      cancelButtonText: tCommon('cancel')
    });

    if (!result.isConfirmed) return;

    try {
      await permissionService.delete(id);
      Swal.fire({
        title: tCommon('confirm'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
      await loadPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorDeleting'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  return (
    <PermissionGuard permission="READ_PERMISSIONS">
    <DashboardLayout>
      <div className={styles.permissionsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><Key size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          {hasPermission('CREATE_PERMISSIONS') && (
            <button className={styles.addButton} onClick={handleCreate}>
              <Plus size={20} />
              <span>{t('createNew')}</span>
            </button>
          )}
        </div>

        <div className={styles.permissionsCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : permissions.length === 0 ? (
            <div className={styles.emptyState}>
              <Key size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.permissionsTable}>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>Módulo</th>
                    <th>{t('description')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td className={styles.permissionName}>{permission.name}</td>
                      <td>
                        {permission.module ? (
                          <span className={styles.moduleBadge}>{permission.module}</span>
                        ) : '-'}
                      </td>
                      <td className={styles.permissionDescription}>
                        {permission.description || '-'}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {hasPermission('UPDATE_PERMISSIONS') && (
                            <button
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={() => handleEdit(permission)}
                              title={tCommon('edit')}
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {hasPermission('DELETE_PERMISSIONS') && (
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleDelete(permission.id)}
                              title={tCommon('delete')}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <PermissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          permission={selectedPermission}
        />
      </div>
    </DashboardLayout>
    </PermissionGuard>
  );
}
