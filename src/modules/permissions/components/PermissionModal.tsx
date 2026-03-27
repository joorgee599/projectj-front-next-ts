'use client';

import React, { useState, useEffect } from 'react';
import { Permission, PermissionRequest } from '../types/permission.types';
import { useTranslations } from 'next-intl';
import styles from './PermissionModal.module.css';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PermissionRequest) => Promise<void>;
  permission?: Permission | null;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, onSubmit, permission }) => {
  const t = useTranslations('permissions');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<PermissionRequest>({
    name: '',
    description: '',
    module: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || '',
        module: permission.module || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        module: '',
      });
    }
    setErrors({});
  }, [permission, isOpen]);

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
      await onSubmit(formData);
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
          <h2>{permission ? t('editPermission') : t('createNew')}</h2>
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
            <label htmlFor="module">Módulo</label>
            <input
              type="text"
              id="module"
              value={formData.module || ''}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              disabled={isSubmitting}
              placeholder="Ej: PRODUCTS, USERS, SALES..."
            />
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
              {isSubmitting ? tCommon('loading') : (permission ? tCommon('save') : tCommon('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
