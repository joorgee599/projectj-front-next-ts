'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { Warehouse, Plus, Pencil, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { PermissionGuard } from '@/core/auth/PermissionGuard';
import { useAuth } from '@/core/auth/useAuth';
import { InventoryModal } from '@/modules/inventory/components/InventoryModal';
import { inventoryService } from '@/modules/inventory/services/inventory.service';
import { Inventory, InventoryStatus, MovementType } from '@/modules/inventory/types/inventory.types';
import { authService } from '@/modules/auth/services/auth.service';
import styles from './page.module.css';

export default function InventoryPage() {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadInventories();
  }, []);

  const loadInventories = async () => {
    try {
      setIsLoading(true);
      const data = await inventoryService.getAll();
      setInventories(data);
    } catch {
      Swal.fire({ title: tCommon('error'), text: t('errorLoading'), icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedInventory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: Inventory) => {
    setSelectedInventory(inv);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: { description?: string; document?: string; details: any[] }) => {
    const user = authService.getCurrentUser();
    const userId = 1; // fallback; ideally resolved from user profile

    try {
      if (selectedInventory) {
        await inventoryService.update(selectedInventory.id, {
          description: data.description,
          document: data.document,
          details: data.details,
        });
        Swal.fire({ title: tCommon('confirm'), text: t('updatedSuccess'), icon: 'success', timer: 2000, confirmButtonColor: '#4f46e5' });
      } else {
        await inventoryService.create({
          description: data.description,
          document: data.document,
          userId,
          details: data.details,
        });
        Swal.fire({ title: tCommon('confirm'), text: t('createdSuccess'), icon: 'success', timer: 2000, confirmButtonColor: '#4f46e5' });
      }
      await loadInventories();
    } catch (error: any) {
      Swal.fire({ title: tCommon('error'), text: error?.message || t('errorSaving'), icon: 'error', confirmButtonColor: '#4f46e5' });
      throw error;
    }
  };

  const handleConfirm = async (inv: Inventory) => {
    const result = await Swal.fire({
      title: t('confirmConfirm'),
      text: t('confirmText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: t('confirm'),
      cancelButtonText: tCommon('cancel'),
    });
    if (!result.isConfirmed) return;
    try {
      await inventoryService.confirm(inv.id);
      Swal.fire({ title: tCommon('confirm'), text: t('confirmedSuccess'), icon: 'success', timer: 2000, confirmButtonColor: '#4f46e5' });
      await loadInventories();
    } catch (error: any) {
      Swal.fire({ title: tCommon('error'), text: error?.message || t('errorConfirming'), icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  const handleCancel = async (inv: Inventory) => {
    const result = await Swal.fire({
      title: t('cancelConfirm'),
      text: t('cancelText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: tCommon('yes'),
      cancelButtonText: tCommon('cancel'),
    });
    if (!result.isConfirmed) return;
    try {
      await inventoryService.cancel(inv.id);
      Swal.fire({ title: tCommon('confirm'), text: t('cancelledSuccess'), icon: 'success', timer: 2000, confirmButtonColor: '#4f46e5' });
      await loadInventories();
    } catch (error: any) {
      Swal.fire({ title: tCommon('error'), text: error?.message || t('errorCancelling'), icon: 'error', confirmButtonColor: '#4f46e5' });
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
      cancelButtonText: tCommon('cancel'),
    });
    if (!result.isConfirmed) return;
    try {
      await inventoryService.delete(id);
      Swal.fire({ title: tCommon('confirm'), text: t('deletedSuccess'), icon: 'success', timer: 2000, confirmButtonColor: '#4f46e5' });
      await loadInventories();
    } catch (error: any) {
      Swal.fire({ title: tCommon('error'), text: error?.message || t('errorDeleting'), icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  const statusClass = (status: InventoryStatus) => {
    if (status === 'CONFIRMED') return styles.statusConfirmed;
    if (status === 'CANCELLED') return styles.statusCancelled;
    return styles.statusDraft;
  };

  const statusLabel = (status: InventoryStatus) => {
    if (status === 'CONFIRMED') return t('statusConfirmed');
    if (status === 'CANCELLED') return t('statusCancelled');
    return t('statusDraft');
  };

  const movementClass = (type: MovementType) => {
    if (type === 'ENTRADA') return styles.typeEntrada;
    if (type === 'SALIDA') return styles.typeSalida;
    return styles.typeAjuste;
  };

  return (
    <PermissionGuard permission="READ_INVENTORY">
      <DashboardLayout>
        <div className={styles.inventoryPage}>
          <div className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <h1><Warehouse size={28} className={styles.titleIcon} /> {t('title')}</h1>
              <p>{t('subtitle')}</p>
            </div>
            {hasPermission('CREATE_INVENTORY') && (
              <button className={styles.addButton} onClick={handleCreate}>
                <Plus size={20} />
                <span>{t('createNew')}</span>
              </button>
            )}
          </div>

          <div className={styles.tableCard}>
            {isLoading ? (
              <div className={styles.loading}><p>{tCommon('loading')}</p></div>
            ) : inventories.length === 0 ? (
              <div className={styles.emptyState}>
                <Warehouse size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3>{t('noData')}</h3>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('document')}</th>
                      <th>{t('description')}</th>
                      <th>{t('status')}</th>
                      <th>{t('details')}</th>
                      <th>{tCommon('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventories.map(inv => (
                      <React.Fragment key={inv.id}>
                        <tr>
                          <td className={styles.idCell}>{inv.id}</td>
                          <td className={styles.documentCell}>{inv.document || '-'}</td>
                          <td className={styles.descCell}>{inv.description || '-'}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${statusClass(inv.status)}`}>
                              {statusLabel(inv.status)}
                            </span>
                          </td>
                          <td>
                            <button
                              className={styles.detailsToggle}
                              onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                            >
                              <Eye size={14} />
                              <span>{inv.details?.length ?? 0} {t('lines')}</span>
                            </button>
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {inv.status === 'DRAFT' && (
                                <>
                                  {hasPermission('UPDATE_INVENTORY') && (
                                    <button
                                      className={`${styles.actionButton} ${styles.editButton}`}
                                      onClick={() => handleEdit(inv)}
                                      title={tCommon('edit')}
                                    >
                                      <Pencil size={15} />
                                    </button>
                                  )}
                                  {hasPermission('CONFIRM_INVENTORY') && (
                                    <button
                                      className={`${styles.actionButton} ${styles.confirmButton}`}
                                      onClick={() => handleConfirm(inv)}
                                      title={t('confirm')}
                                    >
                                      <CheckCircle size={15} />
                                    </button>
                                  )}
                                  {hasPermission('DELETE_INVENTORY') && (
                                    <button
                                      className={`${styles.actionButton} ${styles.deleteButton}`}
                                      onClick={() => handleDelete(inv.id)}
                                      title={tCommon('delete')}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </>
                              )}
                              {inv.status === 'CONFIRMED' && (
                                <>
                                  {hasPermission('CANCEL_INVENTORY') && (
                                    <button
                                      className={`${styles.actionButton} ${styles.cancelActionButton}`}
                                      onClick={() => handleCancel(inv)}
                                      title={t('cancel')}
                                    >
                                      <XCircle size={15} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedId === inv.id && inv.details?.length > 0 && (
                          <tr className={styles.detailsRow}>
                            <td colSpan={6}>
                              <div className={styles.detailsExpanded}>
                                <table className={styles.detailsInnerTable}>
                                  <thead>
                                    <tr>
                                      <th>{t('product')}</th>
                                      <th>{t('movementType')}</th>
                                      <th>{t('quantity')}</th>
                                      <th>{t('unitCost')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {inv.details.map(d => (
                                      <tr key={d.id}>
                                        <td>#{d.productId}</td>
                                        <td>
                                          <span className={`${styles.typeBadge} ${movementClass(d.type)}`}>
                                            {t(`type${d.type}`)}
                                          </span>
                                        </td>
                                        <td>{d.quantity}</td>
                                        <td>{d.unitCost != null ? `$${d.unitCost}` : '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <InventoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          inventory={selectedInventory}
        />
      </DashboardLayout>
    </PermissionGuard>
  );
}
