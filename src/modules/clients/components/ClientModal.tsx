'use client';

import React, { useState, useEffect } from 'react';
import { Client, ClientRequest } from '../types/client.types';
import { useTranslations } from 'next-intl';
import styles from './ClientModal.module.css';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientRequest) => Promise<void>;
  client?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  client 
}) => {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<ClientRequest>({
    name: '',
    email: '',
    document: '',
    phone: '',
    address: '',
    temporaryPassword: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        document: client.document,
        phone: client.phone,
        address: client.address,
        temporaryPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        document: '',
        phone: '',
        address: '',
        temporaryPassword: '',
      });
    }
    setErrors({});
  }, [client, isOpen]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) newErrors.name = t('nameRequired');
    if (!formData.email?.trim()) {
      newErrors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    if (!formData.document?.trim()) newErrors.document = t('documentRequired');
    if (!formData.phone?.trim()) newErrors.phone = t('phoneRequired');
    if (!formData.address?.trim()) newErrors.address = t('addressRequired');
    
    if (!client && !formData.temporaryPassword?.trim()) {
      newErrors.temporaryPassword = t('passwordRequired');
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
      if (client) {
        delete submitData.temporaryPassword;
      }
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {client ? `✏️ ${t('editClient')}` : `➕ ${t('createNew')}`}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('name')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                disabled={isSubmitting}
                placeholder={t('namePlaceholder')}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('email')} *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="client@example.com"
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('document')} *</label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className={`${styles.input} ${errors.document ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="ID / Tax ID"
                />
                {errors.document && <span className={styles.error}>{errors.document}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('phone')} *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                  placeholder="+1 234 567 890"
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>

              {!client && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>{t('password')} *</label>
                  <input
                    type="password"
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    className={`${styles.input} ${errors.temporaryPassword ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                    placeholder={t('passwordRequired')}
                  />
                  {errors.temporaryPassword && <span className={styles.error}>{errors.temporaryPassword}</span>}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('address')} *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                disabled={isSubmitting}
                placeholder={t('addressPlaceholder')}
              />
              {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>
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
              {isSubmitting ? tCommon('loading') : (client ? tCommon('save') : tCommon('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
