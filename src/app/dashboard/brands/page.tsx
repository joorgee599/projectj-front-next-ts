'use client';

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import {
  Factory,
  Plus,
  Pencil,
  Trash2,
  Calendar
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { BrandModal } from '@/modules/brands/components/BrandModal';
import { brandService } from '@/modules/brands/services/brand.service';
import { Brand, BrandRequest } from '@/modules/brands/types/brand.types';
import styles from './page.module.css';

export default function BrandsPage() {
  const t = useTranslations('brands');
  const tCommon = useTranslations('common');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
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
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleSubmit = async (brandData: BrandRequest) => {
    try {
      if (selectedBrand) {
        await brandService.update(selectedBrand.id, brandData);
        Swal.fire({
          title: t('updated'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await brandService.create(brandData);
        Swal.fire({
          title: t('created'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
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
      await brandService.delete(id);
      setBrands(brands.filter(b => b.id !== id));

      Swal.fire({
        title: t('deleted'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
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
      await brandService.updateStatus(id, currentStatus);

      setBrands(brands.map(b =>
        b.id === id ? { ...b, status: newStatus } : b
      ));

      Swal.fire({
        title: t('statusUpdated'),
        html: `${t('brand')} <strong>${statusText}</strong>`,
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

  return (
    <DashboardLayout>
      <div className={styles.brandsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><Factory size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>{t('createNew')}</span>
          </button>
        </div>

        <div className={styles.brandsCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : brands.length === 0 ? (
            <div className={styles.emptyState}>
              <Factory size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
              <button className={styles.addButton} onClick={handleCreate} style={{ marginTop: '1rem', margin: '0 auto' }}>
                <Plus size={18} /> {t('createFirst')}
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.brandsTable}>
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
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td>{brand.id}</td>
                      <td className={styles.brandName}>{brand.name}</td>
                      <td className={styles.description}>
                        {brand.description || '-'}
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <label className={styles.statusToggle}>
                            <input
                              type="checkbox"
                              checked={brand.status === 1}
                              onChange={() => handleStatusToggle(brand.id, brand.status)}
                              disabled={updatingStatus === brand.id}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span
                            className={`${styles.status} ${
                              brand.status === 1 ? styles.active : styles.inactive
                            }`}
                          >
                            {brand.status === 1 ? tCommon('active') : tCommon('inactive')}
                          </span>
                        </div>
                      </td>
                      <td className={styles.date}>{formatDate(brand.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(brand)}
                            title={tCommon('edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(brand.id)}
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

        <BrandModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          brand={selectedBrand}
        />
      </div>
    </DashboardLayout>
  );
}
