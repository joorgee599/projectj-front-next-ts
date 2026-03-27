'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  FolderTree, 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar 
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { PermissionGuard } from '@/core/auth/PermissionGuard';
import { useAuth } from '@/core/auth/useAuth';
import { CategoryModal } from '@/modules/categories/components/CategoryModal';
import { categoryService } from '@/modules/categories/services/category.service';
import { Category, CategoryRequest } from '@/modules/categories/types/category.types';
import styles from './page.module.css';

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
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
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (categoryData: CategoryRequest) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, categoryData);
        Swal.fire({
          title: t('updated'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await categoryService.create(categoryData);
        Swal.fire({
          title: t('created'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
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
      await categoryService.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      
      Swal.fire({
        title: t('deleted'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorDeleting'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (category: Category) => {
    setUpdatingStatus(category.id);
    try {
      const newStatus = category.status === 1 ? 0 : 1;
      await categoryService.updateStatus(category.id, category.status);
      
      setCategories(categories.map(c => 
        c.id === category.id ? { ...c, status: newStatus } : c
      ));
      
      Swal.fire({
        title: t('statusUpdated'),
        text: `${t('category')} ${newStatus === 1 ? t('activated') : t('deactivated')}`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
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

  return (
    <PermissionGuard permission="READ_CATEGORIES">
    <DashboardLayout>
      <div className={styles.categoriesPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><FolderTree size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          {hasPermission('CREATE_CATEGORIES') && (
            <button className={styles.addButton} onClick={handleCreate}>
              <Plus size={20} />
              <span>{t('createNew')}</span>
            </button>
          )}
        </div>

        <div className={styles.categoriesCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyState}>
              <FolderTree size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
              {hasPermission('CREATE_CATEGORIES') && (
                <button className={styles.addButton} onClick={handleCreate} style={{ marginTop: '1rem', margin: '0 auto' }}>
                  <Plus size={18} /> {t('createFirst')}
                </button>
              )}
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.categoriesTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('name')}</th>
                    <th>{t('description')}</th>
                    <th>{tCommon('status')}</th>
                    <th><Calendar size={16} /> {t('createdAt')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className={styles.categoryName}>{category.name}</td>
                      <td className={styles.description}>
                        {category.description || '-'}
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <label className={styles.statusToggle}>
                            <input
                              type="checkbox"
                              checked={category.status === 1}
                              onChange={() => handleStatusToggle(category)}
                              disabled={updatingStatus === category.id || !hasPermission('CHANGE_STATUS_CATEGORIES')}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span
                            className={`${styles.status} ${
                              category.status === 1 ? styles.active : styles.inactive
                            }`}
                          >
                            {category.status === 1 ? tCommon('active') : tCommon('inactive')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.date}>{formatDate(category.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          {hasPermission('UPDATE_CATEGORIES') && (
                            <button
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={() => handleEdit(category)}
                              title={tCommon('edit')}
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {hasPermission('DELETE_CATEGORIES') && (
                            <button
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() => handleDelete(category.id)}
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

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          category={selectedCategory}
        />
      </div>
    </DashboardLayout>
    </PermissionGuard>
  );
}
