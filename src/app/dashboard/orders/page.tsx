'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { CheckCircle, Eye, Pencil, Plus, ShoppingCart, Trash2, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { PermissionGuard } from '@/core/auth/PermissionGuard';
import { useAuth } from '@/core/auth/useAuth';
import { productService } from '@/modules/products/services/product.service';
import { Product } from '@/modules/products/types/product.types';
import { clientService } from '@/modules/clients/services/client.service';
import { Client } from '@/modules/clients/types/client.types';
import { saleService } from '@/modules/sales/services/sale.service';
import { Sale, SaleStatus } from '@/modules/sales/types/sale.types';
import styles from './page.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [salesData, productData, clientData] = await Promise.all([
        saleService.getAll(),
        productService.getAll(),
        clientService.getAll(),
      ]);
      setSales(salesData);
      setProducts(productData);
      setClients(clientData.filter((c) => c.status === 1));
    } catch {
      Swal.fire({ title: 'Error', text: 'No se pudo cargar la informacion.', icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsLoading(false);
    }
  };

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const clientsById = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);

  const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value ?? 0);

  const handleConfirm = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'Confirmar venta?',
      text: `La venta #${sale.id} descontara el inventario.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await saleService.confirm(sale.id);
      Swal.fire({ title: 'Confirmada', icon: 'success', timer: 2000, showConfirmButton: false });
      await loadData();
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e?.message || 'No se pudo confirmar.', icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  const handleCancel = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'Cancelar venta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Si, cancelar',
      cancelButtonText: 'No',
    });
    if (!result.isConfirmed) return;
    try {
      await saleService.cancel(sale.id);
      Swal.fire({ title: 'Cancelada', icon: 'success', timer: 2000, showConfirmButton: false });
      await loadData();
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e?.message || 'No se pudo cancelar.', icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  const handleDelete = async (sale: Sale) => {
    const result = await Swal.fire({
      title: 'Eliminar venta?',
      text: 'Esta accion no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await saleService.delete(sale.id);
      Swal.fire({ title: 'Eliminada', icon: 'success', timer: 2000, showConfirmButton: false });
      await loadData();
    } catch (e: any) {
      Swal.fire({ title: 'Error', text: e?.message || 'No se pudo eliminar.', icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  const statusClass = (status: SaleStatus) => {
    if (status === 'CONFIRMED') return styles.statusConfirmed;
    if (status === 'CANCELLED') return styles.statusCancelled;
    return styles.statusPending;
  };

  const statusLabel = (status: SaleStatus) => {
    if (status === 'CONFIRMED') return 'Confirmada';
    if (status === 'CANCELLED') return 'Cancelada';
    return 'Pendiente';
  };

  return (
    <PermissionGuard permission="READ_SALES">
    <DashboardLayout>
      <div className={styles.salesPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><ShoppingCart size={28} className={styles.titleIcon} /> Ventas</h1>
            <p>Registro de ventas internas del vendedor al cliente</p>
          </div>
          {hasPermission('CREATE_SALES') && (
            <button className={styles.addButton} onClick={() => router.push('/dashboard/orders/create')}>
              <Plus size={20} />
              <span>Nueva venta</span>
            </button>
          )}
        </div>

        <div className={styles.tableCard}>
          {isLoading ? (
            <div className={styles.loading}><p>Cargando ventas...</p></div>
          ) : sales.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>No hay ventas registradas</h3>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Pago</th>
                    <th>Descripcion</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Lineas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <React.Fragment key={sale.id}>
                      <tr>
                        <td className={styles.idCell}>{sale.id}</td>
                        <td>{clientsById.get(sale.clientId!)?.name ?? <span className={styles.muted}>&mdash;</span>}</td>
                        <td className={styles.methodCell}>{sale.paymentMethod ?? '&mdash;'}</td>
                        <td className={styles.descCell}>{sale.description || '&mdash;'}</td>
                        <td className={styles.amountCell}>{formatCurrency(sale.totalAmount)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${statusClass(sale.status)}`}>
                            {statusLabel(sale.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.detailsToggle}
                            onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                          >
                            <Eye size={14} />
                            <span>{sale.details?.length ?? 0} lineas</span>
                          </button>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            {sale.status === 'PENDING' && (
                              <>
                                {hasPermission('UPDATE_SALES') && (
                                  <button
                                    className={`${styles.actionButton} ${styles.editButton}`}
                                    onClick={() => router.push(`/dashboard/orders/edit/${sale.id}`)}
                                    title="Editar"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                )}
                                {hasPermission('CONFIRM_SALES') && (
                                  <button
                                    className={`${styles.actionButton} ${styles.confirmButton}`}
                                    onClick={() => void handleConfirm(sale)}
                                    title="Confirmar"
                                  >
                                    <CheckCircle size={15} />
                                  </button>
                                )}
                                {hasPermission('DELETE_SALES') && (
                                  <button
                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                    onClick={() => void handleDelete(sale)}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </>
                            )}
                            {sale.status === 'CONFIRMED' && (
                              <>
                                {hasPermission('CANCEL_SALES') && (
                                  <button
                                    className={`${styles.actionButton} ${styles.cancelActionButton}`}
                                    onClick={() => void handleCancel(sale)}
                                    title="Cancelar"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedId === sale.id && sale.details && sale.details.length > 0 && (
                        <tr className={styles.detailsRow}>
                          <td colSpan={8}>
                            <div className={styles.detailsExpanded}>
                              <table className={styles.detailsInnerTable}>
                                <thead>
                                  <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio unit.</th>
                                    <th>Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.details.map((detail, idx) => (
                                    <tr key={detail.id ?? idx}>
                                      <td>{productsById.get(detail.productId)?.name ?? `#${detail.productId}`}</td>
                                      <td>{detail.quantity}</td>
                                      <td>{formatCurrency(detail.unitPrice)}</td>
                                      <td>{formatCurrency(detail.subtotal ?? (detail.quantity * (detail.unitPrice ?? 0)))}</td>
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
    </DashboardLayout>
    </PermissionGuard>
  );
}
