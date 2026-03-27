'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { Eye, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { productService } from '@/modules/products/services/product.service';
import { Product } from '@/modules/products/types/product.types';
import { Client } from '@/modules/clients/types/client.types';
import { saleService } from '@/modules/sales/services/sale.service';
import { Sale } from '@/modules/sales/types/sale.types';
import { cartSyncService } from '@/modules/cart/services/cart-sync.service';
import { PAYMENT_METHODS, PAYMENT_METHOD_TRANSLATION_KEY } from '@/modules/sales/constants/payment-methods';
import styles from '../../comprar/page.module.css';

export default function DashboardCartPage() {
  const locale = useLocale();
  const t = useTranslations('cart');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Sale | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [quantityByProduct, setQuantityByProduct] = useState<Record<number, string>>({});
  const [lineQuantities, setLineQuantities] = useState<Record<number, string>>({});
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setPaymentMethod(cart?.paymentMethod ?? 'CASH');
    setDescription(cart?.description ?? '');
    setLineQuantities(
      Object.fromEntries((cart?.details ?? []).map((detail) => [detail.id ?? detail.productId, String(detail.quantity)]))
    );
  }, [cart]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setInfoMessage(null);

      const [productData, resolvedClient] = await Promise.all([
        productService.getAll(),
        cartSyncService.resolveClientForCurrentUser(),
      ]);

      setProducts(productData.filter((product) => product.status === 1 && product.stock > 0));
      setClient(resolvedClient);

      if (!resolvedClient) {
        setCart(null);
        setInfoMessage(t('clientRequired'));
        return;
      }

      const saleData = await saleService.getCurrentCart(resolvedClient.id);
      setCart(saleData);
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.message || t('loadError'),
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

  const getDesiredQuantity = (product: Product) => {
    const rawValue = quantityByProduct[product.id] ?? '1';
    const parsedValue = Number(rawValue);
    if (!rawValue.trim() || Number.isNaN(parsedValue)) return 1;
    return Math.max(1, Math.min(parsedValue, product.stock));
  };

  const setDesiredQuantity = (productId: number, quantity: string) => {
    setQuantityByProduct((current) => ({
      ...current,
      [productId]: quantity,
    }));
  };

  const commitDesiredQuantity = (product: Product) => {
    setDesiredQuantity(product.id, String(getDesiredQuantity(product)));
  };

  const addItem = async (product: Product) => {
    try {
      setIsSubmitting(true);
      if (!client) {
        throw new Error(t('clientRequired'));
      }

      const activeCart = cart ?? await saleService.getOrCreateCart(client.id, client.userId);
      const updated = await saleService.addItem(activeCart.id, {
        productId: product.id,
        quantity: getDesiredQuantity(product),
      });
      setCart(updated);
      setDesiredQuantity(product.id, '1');
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error?.message || t('addError'), icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = async (detailId: number | undefined, quantity: number) => {
    if (!cart || !detailId) return;
    try {
      setIsSubmitting(true);
      const updated = quantity <= 0
        ? await saleService.removeItem(cart.id, detailId)
        : await saleService.updateItem(cart.id, detailId, quantity);
      setCart(updated);
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error?.message || t('updateError'), icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLineQuantityChange = (detailKey: number, quantity: string) => {
    setLineQuantities((current) => ({
      ...current,
      [detailKey]: quantity,
    }));
  };

  const persistLineQuantity = async (detailId: number | undefined, detailKey: number) => {
    const rawValue = lineQuantities[detailKey] ?? '';
    const parsedValue = Number(rawValue);

    if (!rawValue.trim() || Number.isNaN(parsedValue)) {
      setLineQuantities((current) => ({ ...current, [detailKey]: '1' }));
      await updateItem(detailId, 1);
      return;
    }

    await updateItem(detailId, Math.max(1, parsedValue));
  };

  const saveOrderDetails = async () => {
    if (!cart || !client || cart.status !== 'PENDING') return;

    try {
      setIsSubmitting(true);
      const updated = await saleService.update(cart.id, {
        clientId: cart.clientId ?? client.id,
        userId: cart.userId,
        paymentMethod,
        description,
      });
      setCart(updated);
      Swal.fire({
        title: t('detailsSaved'),
        text: t('detailsSavedMessage'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.message || t('detailSaveError'),
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmCart = async () => {
    if (!cart) return;
    try {
      setIsSubmitting(true);
      await saleService.confirm(cart.id);
      Swal.fire({ title: t('confirmSuccessTitle'), text: t('confirmSuccessMessage'), icon: 'success', confirmButtonColor: '#4f46e5' });
      await loadData();
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error?.message || t('confirmError'), icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>{t('dashboardTitle')}</h1>
            <p className={styles.subtitle}>{t('dashboardSubtitle')}</p>
            {infoMessage && <p className={styles.helperText}>{infoMessage}</p>}
          </div>
        </header>

        <div className={styles.layout}>
          <section className={styles.catalogSection}>
            <div className={styles.sectionHeader}>
              <h2><ShoppingCart size={20} /> {t('continueShopping')}</h2>
              <span>{t('availableProducts', { count: products.length })}</span>
            </div>

            {isLoading ? (
              <div className={styles.emptyState}>{t('loadingProducts')}</div>
            ) : (
              <div className={styles.productGrid}>
                {products.map((product) => (
                  <article
                    key={product.id}
                    className={styles.productCard}
                    onClick={() => setSelectedProduct(product)}
                  >
                    {/* Product image with hover overlay */}
                    <div className={styles.productImageWrap}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className={styles.productImg} />
                      ) : (
                        <div className={styles.productImgPlaceholder}>🛍️</div>
                      )}
                      <div className={styles.productImageOverlay}>
                        <span className={styles.productImageOverlayText}><Eye size={16} /> {t('viewDetails')}</span>
                      </div>
                    </div>

                    {/* Product body */}
                    <div className={styles.productBody}>
                      {product.brandName && <p className={styles.productBrand}>{product.brandName}</p>}
                      <h3>{product.name}</h3>
                      <p className={styles.productCode}>{product.code}</p>
                      <div className={styles.productMeta}>
                        <span className={styles.stockBadge}>{t('stock', { count: product.stock })}</span>
                      </div>
                      <p className={styles.productPrice}>{formatCurrency(product.price)}</p>

                      <div className={styles.productFooter} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.quantityRow}>
                          <label className={styles.quantityLabel} htmlFor={`dashboard-product-${product.id}`}>
                            {t('quantityShort')}
                          </label>
                          <input
                            id={`dashboard-product-${product.id}`}
                            type="number"
                            min={1}
                            max={product.stock}
                            value={quantityByProduct[product.id] ?? '1'}
                            onChange={(event) => setDesiredQuantity(product.id, event.target.value)}
                            onBlur={() => commitDesiredQuantity(product)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                commitDesiredQuantity(product);
                              }
                            }}
                            className={styles.quantityInput}
                            disabled={isSubmitting || !client || cart?.status === 'CONFIRMED'}
                          />
                        </div>
                        <button
                          className={styles.addButton}
                          onClick={() => void addItem(product)}
                          disabled={isSubmitting || !client || cart?.status === 'CONFIRMED'}
                        >
                          <Plus size={15} /> {t('add')}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.cartSection}>
            <div className={styles.sectionHeader}>
              <h2><ShoppingCart size={20} /> {t('myCart')}</h2>
              <span>{t('lines', { count: cart?.details?.length ?? 0 })}</span>
            </div>

            <div className={styles.metadataPanel}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>{t('paymentMethod')}</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className={styles.selectInput}
                    disabled={!cart || cart.status !== 'PENDING' || isSubmitting}
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{t(PAYMENT_METHOD_TRANSLATION_KEY[method])}</option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span>{t('description')}</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className={styles.textArea}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                    disabled={!cart || cart.status !== 'PENDING' || isSubmitting}
                  />
                </label>
              </div>
              <div className={styles.summaryButtonRow}>
                <p className={styles.helperText}>{cart ? t('dashboardSubtitle') : t('detailsHelp')}</p>
                <button className={styles.secondaryCta} onClick={() => void saveOrderDetails()} disabled={!cart || cart.status !== 'PENDING' || isSubmitting}>
                  {t('saveDetails')}
                </button>
              </div>
            </div>

            {!cart || cart.details.length === 0 ? (
              <div className={styles.emptyState}>{infoMessage || t('emptyPrivate')}</div>
            ) : (
              <div className={styles.cartList}>
                {cart.details.map((detail) => {
                  const product = productsById.get(detail.productId);
                  const detailKey = detail.id ?? detail.productId;
                  return (
                    <div key={detailKey} className={styles.cartItem}>
                      {/* Thumbnail */}
                      <div className={styles.cartItemThumb}>
                        {product?.image
                          ? <img src={product.image} alt={product.name} className={styles.cartItemThumbImg} />
                          : <span className={styles.cartItemThumbPlaceholder}>🛍️</span>
                        }
                      </div>

                      <div className={styles.cartItemInfo}>
                        <strong>{product?.name || `Producto #${detail.productId}`}</strong>
                        <p className={styles.cartItemPrice}>{formatCurrency((detail.unitPrice ?? 0) * detail.quantity)}</p>
                      </div>

                      <div className={styles.itemControls}>
                        <button disabled={cart.status !== 'PENDING'} onClick={() => void updateItem(detail.id, detail.quantity - 1)}><Minus size={13} /></button>
                        <input
                          type="number"
                          min={1}
                          max={product?.stock ?? detail.quantity}
                          value={lineQuantities[detailKey] ?? String(detail.quantity)}
                          onChange={(event) => handleLineQuantityChange(detailKey, event.target.value)}
                          onBlur={() => void persistLineQuantity(detail.id, detailKey)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              void persistLineQuantity(detail.id, detailKey);
                            }
                          }}
                          className={styles.itemQuantityInput}
                          aria-label={t('quantity')}
                          disabled={cart.status !== 'PENDING'}
                        />
                        <button disabled={cart.status !== 'PENDING'} onClick={() => void updateItem(detail.id, detail.quantity + 1)}><Plus size={13} /></button>
                        <button className={styles.deleteBtn} disabled={cart.status !== 'PENDING'} onClick={() => void updateItem(detail.id, 0)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>{t('subtotal', { count: cart?.details?.reduce((s, d) => s + d.quantity, 0) ?? 0 })}</span>
                <span>{formatCurrency(cart?.totalAmount ?? 0)}</span>
              </div>
              <div className={styles.summaryRowTotal}>
                <span>{t('total')}</span>
                <strong>{formatCurrency(cart?.totalAmount ?? 0)}</strong>
              </div>
              <button className={styles.primaryFull} onClick={() => void confirmCart()} disabled={isSubmitting || !cart || cart.details.length === 0 || cart.status !== 'PENDING'}>
                {t('confirmPurchase')}
              </button>
            </div>
          </aside>
        </div>

        {/* Product detail modal */}
        {selectedProduct && (
          <div className={styles.modalBackdrop} onClick={() => setSelectedProduct(null)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalBadges}>
                  {selectedProduct.brandName && <p className={styles.productBrand}>{selectedProduct.brandName}</p>}
                  <span className={styles.categoryBadge}>{selectedProduct.categoryName || t('noCategory')}</span>
                  <span className={styles.stockBadge}>{t('stock', { count: selectedProduct.stock })}</span>
                </div>
                <button className={styles.modalCloseBtn} onClick={() => setSelectedProduct(null)}><X size={16} /></button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalImageWrap}>
                  {selectedProduct.image
                    ? <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.modalImage} />
                    : <span className={styles.modalImagePlaceholder}>🛍️</span>
                  }
                </div>
                <div className={styles.modalInfo}>
                  <h2 className={styles.modalTitle}>{selectedProduct.name}</h2>
                  <p className={styles.modalPrice}>{formatCurrency(selectedProduct.price)}</p>
                  <div className={styles.modalMeta}>
                    <div className={styles.modalMetaRow}>
                      <span className={styles.modalMetaLabel}>{t('code')}</span>
                      <span className={styles.modalMetaValue}><code>{selectedProduct.code}</code></span>
                    </div>
                    {selectedProduct.brandName && (
                      <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>{t('brand')}</span>
                        <span className={styles.modalMetaValue}>{selectedProduct.brandName}</span>
                      </div>
                    )}
                    {selectedProduct.categoryName && (
                      <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>{t('category')}</span>
                        <span className={styles.modalMetaValue}>{selectedProduct.categoryName}</span>
                      </div>
                    )}
                    {selectedProduct.description && (
                      <p className={styles.modalDescription}>{selectedProduct.description}</p>
                    )}
                  </div>
                  <div className={styles.modalActions}>
                    <input
                      type="number"
                      min={1}
                      max={selectedProduct.stock}
                      value={quantityByProduct[selectedProduct.id] ?? '1'}
                      onChange={(e) => setDesiredQuantity(selectedProduct.id, e.target.value)}
                      onBlur={() => commitDesiredQuantity(selectedProduct)}
                      className={styles.modalQtyInput}
                      aria-label={t('quantity')}
                      disabled={isSubmitting || !client || cart?.status === 'CONFIRMED'}
                    />
                    <button
                      className={styles.addButton}
                      style={{ flex: 1 }}
                      onClick={() => { void addItem(selectedProduct); setSelectedProduct(null); }}
                      disabled={isSubmitting || !client || cart?.status === 'CONFIRMED'}
                    >
                      <Plus size={15} /> {t('add')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}