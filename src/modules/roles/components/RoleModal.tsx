'use client';

import React, { useState, useEffect } from 'react';
import { Role, RoleRequest, Permission } from '../types/role.types';
import { permissionService } from '@/modules/permissions/services/permission.service';
import { useTranslations } from 'next-intl';
import styles from './RoleModal.module.css';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleRequest) => Promise<void>;
  role?: Role | null;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSubmit, role }) => {
  const t = useTranslations('roles');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<RoleRequest>({
    name: '',
    description: '',
  });
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await permissionService.getAll();
      setAllPermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
      setSelectedPermissionIds(role.permissions?.map(p => p.id) || []);
    } else {
      setFormData({
        name: '',
        description: '',
      });
      setSelectedPermissionIds([]);
    }
    setErrors({});
  }, [role, isOpen]);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissionIds(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = t('nameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        permissionIds: selectedPermissionIds
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{role ? t('editRole') : t('createNew')}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{t('name')} *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? styles.inputError : ''}
              disabled={isSubmitting}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">{t('description')}</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>{t('permissions')}</label>
            <div className={styles.permissionsGrid}>
              {allPermissions.map(permission => {
                const isSelected = selectedPermissionIds.includes(permission.id);
                return (
                  <label key={permission.id} className={`${styles.permissionItem} ${isSelected ? styles.selected : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePermission(permission.id)}
                      className={styles.checkbox}
                    />
                    <div className={styles.permissionInfo}>
                      <span className={styles.permissionName}>{permission.name}</span>
                      {permission.description && (
                        <span className={styles.permissionDesc}>{permission.description}</span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {allPermissions.length === 0 && (
              <p className={styles.noPermissions}>{t('loadingRoles')}</p>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? tCommon('loading') : (role ? tCommon('save') : tCommon('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
