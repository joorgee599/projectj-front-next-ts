'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { ArrowLeft, Users } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { UserForm } from '@/modules/users/components/UserForm';
import { userService } from '@/modules/users/services/user.service';
import { UserRequest } from '@/modules/users/types/user.types';
import styles from '../page.module.css';

export default function CreateUserPage() {
  const router = useRouter();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const handleSubmit = async (submitData: UserRequest) => {
    try {
      await userService.create(submitData);
      Swal.fire({
        title: t('created'),
        text: t('createdSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error creating user:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorSaving'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/users');
  };

  return (
    <DashboardLayout>
      <div className={styles.pageContainer} style={{ padding: '2rem' }}>
        <div className={styles.header} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={20} />
            {tCommon('back')}
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--primary)" /> {t('createNew')}
          </h1>
        </div>
        
        <UserForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  );
}
