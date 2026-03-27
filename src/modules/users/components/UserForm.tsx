'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRequest } from '../types/user.types';
import { Role } from '@/modules/roles/types/role.types';
import { Permission } from '@/modules/permissions/types/permission.types';
import { roleService } from '@/modules/roles/services/role.service';
import { permissionService } from '@/modules/permissions/services/permission.service';
import Select from 'react-select';
import { useTranslations } from 'next-intl';
import styles from './UserForm.module.css';

interface UserFormProps {
  onSubmit: (data: UserRequest) => Promise<void>;
  onCancel: () => void;
  user?: User | null;
}

export const UserForm: React.FC<UserFormProps> = ({ onSubmit, onCancel, user }) => {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formData, setFormData] = useState<UserRequest>({
    name: '',
    email: '',
    password: '',
    roleIds: [],
    permissionIds: [],
    status: 1,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [rolesData, permissionsData] = await Promise.all([
          roleService.getAll(),
          permissionService.getAll()
        ]);
        setRoles([...rolesData].sort((a, b) => a.name.localeCompare(b.name)));
        setPermissions(permissionsData);
      } catch (error) {
        console.error('Error fetching roles and permissions', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password for edits
        roleIds: user.roleIds || [],
        permissionIds: user.permissionIds || [],
        status: user.status ?? 1,
      });
      setConfirmPassword('');
    }
  }, [user]);

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

    if (formData.password?.trim()) {
      if (!confirmPassword.trim()) {
        newErrors.confirmPassword = t('confirmPasswordRequired');
      } else if (formData.password !== confirmPassword) {
        newErrors.confirmPassword = t('passwordMismatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const submitData = { ...formData };
      if (user && !submitData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => {
      const currentRoles = prev.roleIds || [];
      if (currentRoles.includes(roleId)) {
        return { ...prev, roleIds: currentRoles.filter(id => id !== roleId) };
      } else {
        return { ...prev, roleIds: [...currentRoles, roleId] };
      }
    });
  };

  const handlePermissionToggle = (permissionId: number) => {
    setFormData(prev => {
      const currentPerms = prev.permissionIds || [];
      if (currentPerms.includes(permissionId)) {
        return { ...prev, permissionIds: currentPerms.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissionIds: [...currentPerms, permissionId] };
      }
    });
  };

  if (isLoadingData) {
    return <div className={styles.loadingData}>{tCommon('loading')}...</div>;
  }

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: 'var(--background)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)',
      boxShadow: 'none',
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      zIndex: 10,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'var(--hover-bg)' : 'transparent',
      color: 'var(--text-primary)',
      cursor: 'pointer',
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'var(--primary-light)',
      borderRadius: '4px',
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'var(--text-primary)',
      fontWeight: '500',
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'var(--text-primary)',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: 'var(--primary)',
        color: 'white',
      },
    }),
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>{t('basicInfo')}</h3>

          <div className={styles.twoColumnGrid}>
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
              <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? styles.inputError : ''}
                disabled={isSubmitting}
                placeholder={t('confirmPasswordPlaceholder')}
              />
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status">{t('status')}</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                disabled={isSubmitting}
              >
                <option value={1}>{tCommon('active')}</option>
                <option value={0}>{tCommon('inactive')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>{t('roles')}</h3>
          <div className={styles.formGroup}>
            <Select
              isMulti
              name="roles"
              styles={selectStyles}
              options={roles.map(role => ({ value: role.id, label: role.name }))}
              value={roles
                .filter(role => (formData.roleIds || []).includes(role.id))
                .map(role => ({ value: role.id, label: role.name }))}
              onChange={(selectedOptions: any) => {
                const newRoleIds = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
                setFormData({ ...formData, roleIds: newRoleIds });
              }}
              isDisabled={isSubmitting || roles.length === 0}
              placeholder={t('selectRolesPlaceholder') || 'Select roles...'}
              noOptionsMessage={() => t('noRoles')}
              className={styles.reactSelectContainer}
              classNamePrefix="react-select"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>{t('permissions')}</h3>
          {permissions.length === 0 ? (
            <p className={styles.noData}>{t('noPermissions')}</p>
          ) : (
            <div className={styles.modulesWrapper}>
              {(Object.entries(
                permissions.reduce((acc, p) => {
                  const mod = p.module || 'OTHER';
                  if (!acc[mod]) acc[mod] = [];
                  acc[mod].push(p);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ) as [string, Permission[]][]).sort(([a], [b]) => a.localeCompare(b)).map(([mod, perms]) => (
                <div key={mod} className={styles.moduleSection}>
                  <span className={styles.moduleTitle}>{mod}</span>
                  <div className={styles.checkboxGrid}>
                    {perms.map(perm => (
                      <label key={perm.id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={(formData.permissionIds || []).includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          disabled={isSubmitting}
                        />
                        <span className={styles.checkboxText}>{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {tCommon('cancel')}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? tCommon('saving') : (user ? tCommon('update') : tCommon('create'))}
          </button>
        </div>
      </form>
    </div>
  );
};
