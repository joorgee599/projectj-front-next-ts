'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Mail, 
  Shield, 
  Calendar 
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { UserModal } from '@/modules/users/components/UserModal';
import { userService } from '@/modules/users/services/user.service';
import { User, UserRequest } from '@/modules/users/types/user.types';
import styles from './page.module.css';

export default function UsersPage() {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
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
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (userData: UserRequest) => {
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, userData);
        Swal.fire({
          title: t('updated'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await userService.create(userData);
        Swal.fire({
          title: t('created'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
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
      await userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
      
      Swal.fire({
        title: t('deleted'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorDeleting'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? t('activated') : t('deactivated');
    
    try {
      setUpdatingStatus(id);
      await userService.updateStatus(id, currentStatus);
      
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: newStatus } : u
      ));

      Swal.fire({
        title: t('statusUpdated'),
        html: `${t('user')} <strong>${statusText}</strong>`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorUpdating'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleName = (user: User) => {
    return user.roleName || '-';
  };

  return (
    <DashboardLayout>
      <div className={styles.usersPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><Users size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>{t('createNew')}</span>
          </button>
        </div>

        <div className={styles.usersCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
              <button className={styles.addButton} onClick={handleCreate} style={{ marginTop: '1rem', margin: '0 auto' }}>
                <Plus size={18} /> {t('createFirst')}
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('name')}</th>
                    <th><Mail size={16} /> {t('email')}</th>
                    <th><Shield size={16} /> {t('role')}</th>
                    <th>{tCommon('status')}</th>
                    <th><Calendar size={16} /> {t('createdAt')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td className={styles.userName}>{user.name}</td>
                      <td className={styles.email}>{user.email}</td>
                      <td>
                        <span className={styles.role}>{getRoleName(user)}</span>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <label className={styles.statusToggle}>
                            <input
                              type="checkbox"
                              checked={user.status === 1}
                              onChange={() => handleStatusToggle(user.id, user.status)}
                              disabled={updatingStatus === user.id}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span
                            className={`${styles.status} ${
                              user.status === 1 ? styles.active : styles.inactive
                            }`}
                          >
                            {user.status === 1 ? tCommon('active') : tCommon('inactive')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.date}>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(user)}
                            title={tCommon('edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(user.id)}
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

        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          user={selectedUser}
        />
      </div>
    </DashboardLayout>
  );
}
