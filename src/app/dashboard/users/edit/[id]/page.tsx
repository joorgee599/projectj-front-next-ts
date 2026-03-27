'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { ArrowLeft, Users } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { UserForm } from '@/modules/users/components/UserForm';
import { userService } from '@/modules/users/services/user.service';
import { User, UserRequest } from '@/modules/users/types/user.types';
import styles from '../../page.module.css';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id ? parseInt(params.id as string, 10) : null;
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUser(userId);
    }
  }, [userId]);

  const loadUser = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await userService.getById(id);
      setUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorLoading'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        router.push('/dashboard/users');
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (submitData: UserRequest) => {
    if (!userId) return;
    try {
      await userService.update(userId, submitData);
      Swal.fire({
        title: t('updated'),
        text: t('updatedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error updating user:', error);
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
            <Users size={24} color="var(--primary)" /> {t('editUser')}
          </h1>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            {tCommon('loading')}...
          </div>
        ) : (
          <UserForm user={user} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}
      </div>
    </DashboardLayout>
  );
}
