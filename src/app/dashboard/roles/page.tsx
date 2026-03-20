'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  ShieldCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  Lock 
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { RoleModal } from '@/modules/roles/components/RoleModal';
import { roleService } from '@/modules/roles/services/role.service';
import { Role, RoleRequest } from '@/modules/roles/types/role.types';
import styles from './page.module.css';

export default function RolesPage() {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
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
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (roleData: RoleRequest) => {
    try {
      if (selectedRole) {
        await roleService.update(selectedRole.id, roleData);
        Swal.fire({
          title: tCommon('confirm'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await roleService.create(roleData);
        Swal.fire({
          title: tCommon('confirm'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
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
      await roleService.delete(id);
      Swal.fire({
        title: tCommon('confirm'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorDeleting'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.rolesPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><ShieldCheck size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>{t('createNew')}</span>
          </button>
        </div>

        <div className={styles.rolesCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : roles.length === 0 ? (
            <div className={styles.emptyState}>
              <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.rolesTable}>
                <thead>
                  <tr>
                    <th>{t('name')}</th>
                    <th>{t('description')}</th>
                    <th><Lock size={16} /> {t('permissions')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className={styles.roleName}>{role.name}</td>
                      <td className={styles.roleDescription}>
                        {role.description || '-'}
                      </td>
                      <td>
                        <div className={styles.permissionsGroup}>
                          {role.permissions?.slice(0, 5).map(p => (
                            <span key={p.id} className={styles.permissionBadge}>
                              {p.name}
                            </span>
                          ))}
                          {role.permissions && role.permissions.length > 5 && (
                            <span className={styles.permissionBadge}>
                              +{role.permissions.length - 5}
                            </span>
                          )}
                          {(!role.permissions || role.permissions.length === 0) && '-'}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(role)}
                            title={tCommon('edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(role.id)}
                            title={tCommon('delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          role={selectedRole}
        />
      </div>
    </DashboardLayout>
  );
}
