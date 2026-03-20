'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRequest } from '../types/user.types';
import { Role } from '@/modules/roles/types/role.types';
import { roleService } from '../services/user.service';
import { useTranslations } from 'next-intl';
import styles from './UserModal.module.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserRequest) => Promise<void>;
  user?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const t = useTranslations('users');
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    roleService.getAll().then(setRoles).catch(console.error);
  }, []);

  const [formData, setFormData] = useState<UserRequest>({
    name: '',
    email: '',
    password: '',
    roleId: 0,
    status: 1,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't populate password for edits
        roleId: user.roleId || (roles.length > 0 ? roles[0].id : 0),
        status: user.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        roleId: roles.length > 0 ? roles[0].id : 0,
        status: 1,
      });
    }
    setErrors({});
  }, [user, isOpen, roles]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (!formData.email?.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    // Password is required only when creating a new user
    if (!user && !formData.password?.trim()) {
      newErrors.password = t('passwordRequired');
    }

    if (!formData.roleId) {
      newErrors.roleId = t('roleRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      
      // Don't send empty password on update
      const submitData = { ...formData };
      if (user && !formData.password) {
        delete submitData.password;
      }
      console.log('Submitting user data:', submitData);
      await onSubmit(submitData);
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
          <h2>{user ? t('editUser') : t('createNew')}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">{t('name')} *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? styles.inputError : ''}
              disabled={isSubmitting}
              placeholder={t('namePlaceholder')}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">{t('email')} *</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? styles.inputError : ''}
              disabled={isSubmitting}
              placeholder={t('emailPlaceholder')}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              {t('password')} {!user && '*'}
              {user && <span className={styles.helperText}>{t('passwordHelper')}</span>}
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? styles.inputError : ''}
              disabled={isSubmitting}
              placeholder={user ? t('passwordPlaceholder') : t('passwordRequired')}
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="roleId">{t('role')} *</label>
            <select
              id="roleId"
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
              className={errors.roleId ? styles.inputError : ''}
              disabled={isSubmitting || roles.length === 0}
            >
              {roles.length === 0 && <option value="">{t('loadingRoles')}</option>}
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId && <span className={styles.error}>{errors.roleId}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">{t('status')}</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
              disabled={isSubmitting}
            >
              <option value={1}>{t('active')}</option>
              <option value={0}>{t('inactive')}</option>
            </select>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('saving') : (user ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
