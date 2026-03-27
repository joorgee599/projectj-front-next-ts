'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { ArrowLeft, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { productService } from '@/modules/products/services/product.service';
import { Product } from '@/modules/products/types/product.types';
import { clientService } from '@/modules/clients/services/client.service';
import { Client } from '@/modules/clients/types/client.types';
import { saleService } from '@/modules/sales/services/sale.service';
import { Sale } from '@/modules/sales/types/sale.types';
import { PAYMENT_METHODS, PAYMENT_METHOD_TRANSLATION_KEY } from '@/modules/sales/constants/payment-methods';
import styles from '../../../orders/page.module.css';

interface DraftItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const tCart = useTranslations('cart');
  const saleId = params.id ? parseInt(params.id as string, 10) : null;

  const [sale, setSale] = useState<Sale | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [draftQuantities, setDraftQuantities] = useState<Record<number, string>>({});
  const [productSearch, setProductSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDraftQuantities(Object.fromEntries(draftItems.map((item) => [item.productId, String(item.quantity)])));
  }, [draftItems]);

  useEffect(() => {
    if (saleId) {
      void loadData(saleId);
    }
  }, [saleId]);

  const loadData = async (id: number) => {
    try {
      setIsLoading(true);
      const [productData, clientData, saleData] = await Promise.all([
        productService.getAll(),
        clientService.getAll(),
        saleService.getById(id),
      ]);

      if (saleData.status !== 'PENDING') {
        await Swal.fire({
          title: 'No editable',
          text: 'Solo las ventas pendientes se pueden editar.',
          icon: 'warning',
          confirmButtonColor: '#4f46e5',
        });
        router.push('/dashboard/orders');
        return;
      }

      setProducts(productData.filter((product) => product.status === 1));
      setClients(clientData.filter((client) => client.status === 1));
      setSale(saleData);
      setClientId(saleData.clientId ?? '');
      setPaymentMethod(saleData.paymentMethod ?? 'CASH');
      setDescription(saleData.description ?? '');
      setDraftItems(
        saleData.details.map((detail) => ({
          productId: detail.productId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice ?? 0,
        })),
      );
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cargar la venta.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      }).then(() => {
        router.push('/dashboard/orders');
      });
    } finally {
      setIsLoading(false);
    }
  };

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      if (product.stock <= 0) return false;
      if (!query) return true;
      return [product.name, product.code].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
  }, [products, productSearch]);

  const draftTotal = useMemo(() => draftItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0), [draftItems]);

  const formatCurrency = (value: number | undefined) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value ?? 0);

  const addItem = (product: Product) => {
    setDraftItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }
      return [...current, { productId: product.id, quantity: 1, unitPrice: product.price }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = productsById.get(productId);
    if (!product) return;
    if (quantity <= 0) {
      setDraftItems((current) => current.filter((item) => item.productId !== productId));
      return;
    }
    setDraftItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, product.stock) } : item,
      ),
    );
  };

  const handleQuantityChange = (productId: number, value: string) => {
    setDraftQuantities((current) => ({ ...current, [productId]: value }));
  };

  const commitQuantity = (productId: number) => {
    const rawValue = draftQuantities[productId] ?? '';
    const parsedValue = Number(rawValue);

    if (!rawValue.trim() || Number.isNaN(parsedValue)) {
      updateQuantity(productId, 1);
      return;
    }

    updateQuantity(productId, Math.max(1, parsedValue));
  };

  const handleSubmit = async () => {
    if (!saleId || !sale) return;
    if (draftItems.length === 0) {
      Swal.fire({
        title: 'Sin productos',
        text: 'Agrega al menos un producto.',
        icon: 'info',
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await saleService.update(saleId, {
        clientId: clientId === '' ? null : clientId,
        userId: sale.userId,
        paymentMethod,
        description: description.trim() || undefined,
        details: draftItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });

      Swal.fire({
        title: 'Venta actualizada',
        text: 'La venta se actualizo correctamente.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
      });
      router.push('/dashboard/orders');
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.message || 'No se pudo actualizar la venta.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.pageContainer} style={{ padding: '2rem' }}>
        <div className={styles.header} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/dashboard/orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={24} color="var(--primary)" /> Editar venta
          </h1>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Cargando...
          </div>
        ) : (
          <div className={styles.tableCard} style={{ padding: '1.5rem' }}>
            <div className={styles.formRow}>
              <label className={styles.formGroup}>
                <span>Cliente</span>
                <select value={clientId} onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sin cliente</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </label>
              <label className={styles.formGroup}>
                <span>Metodo de pago</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{tCart(PAYMENT_METHOD_TRANSLATION_KEY[method])}</option>)}
                </select>
              </label>
            </div>

            <label className={styles.formGroupFull} style={{ marginTop: '1rem' }}>
              <span>Descripcion</span>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notas opcionales" />
            </label>

            <div style={{ marginTop: '1.5rem' }}>
              <p className={styles.sectionLabel}>Agregar productos</p>
              <label className={styles.searchBox}>
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Buscar por nombre o codigo..." />
              </label>
              <div className={styles.productList}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.name}</span>
                      <span className={styles.productMeta}>{product.code} - stock {product.stock}</span>
                    </div>
                    <span className={styles.productPrice}>{formatCurrency(product.price)}</span>
                    <button className={styles.addItemBtn} onClick={() => addItem(product)}>
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.cartSection} style={{ marginTop: '1.5rem' }}>
              <p className={styles.sectionLabel}>Resumen de la venta</p>
              {draftItems.length === 0 ? (
                <div className={styles.emptyState} style={{ padding: '2rem 1rem' }}>No hay productos agregados</div>
              ) : (
                <table className={styles.cartTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio unit.</th>
                      <th>Cant.</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftItems.map((item) => {
                      const product = productsById.get(item.productId);
                      return (
                        <tr key={item.productId}>
                          <td>{product?.name ?? `#${item.productId}`}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              max={product?.stock}
                              value={draftQuantities[item.productId] ?? String(item.quantity)}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              onBlur={() => commitQuantity(item.productId)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  commitQuantity(item.productId);
                                }
                              }}
                              className={styles.qtyInput}
                            />
                          </td>
                          <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
                          <td>
                            <button className={styles.removeBtn} onClick={() => updateQuantity(item.productId, 0)}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className={styles.totalLabel}>Total</td>
                      <td colSpan={2} className={styles.totalValue}>{formatCurrency(draftTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className={styles.modalFooter} style={{ padding: '1.5rem 0 0', borderTop: 'none' }}>
              <button className={styles.cancelBtn} onClick={() => router.push('/dashboard/orders')} disabled={isSubmitting}>
                Cancelar
              </button>
              <button className={styles.submitBtn} onClick={() => void handleSubmit()} disabled={isSubmitting || draftItems.length === 0}>
                {isSubmitting ? 'Guardando...' : 'Actualizar venta'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}