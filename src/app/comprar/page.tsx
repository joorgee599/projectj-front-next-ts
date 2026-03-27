'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { Eye, LogIn, Minus, Plus, ShoppingCart, Store, Trash2, X } from 'lucide-react';
import { ThemeToggle } from '@/core/design-system/ThemeToggle';
import { LanguageSelector } from '@/core/design-system/LanguageSelector';
import { productService } from '@/modules/products/services/product.service';
import { Product } from '@/modules/products/types/product.types';
import { guestCartService, GuestCartItem } from '@/modules/cart/services/guest-cart.service';
import { authService } from '@/modules/auth/services/auth.service';
import { cartSyncService } from '@/modules/cart/services/cart-sync.service';
import { PAYMENT_METHODS, PAYMENT_METHOD_TRANSLATION_KEY } from '@/modules/sales/constants/payment-methods';
import styles from './page.module.css';

export default function PublicShopPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('cart');
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [quantityByProduct, setQuantityByProduct] = useState<Record<number, string>>({});
  const [itemQuantities, setItemQuantities] = useState<Record<number, string>>({});
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    void loadProducts();
    setItems(guestCartService.getItems());
    const draft = guestCartService.getDraft();
    setPaymentMethod(draft.paymentMethod);
    setDescription(draft.description);
    setHasToken(Boolean(authService.getToken()));
  }, []);

  useEffect(() => {
    setItemQuantities(Object.fromEntries(items.map((item) => [item.productId, String(item.quantity)])));
  }, [items]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data.filter((product) => product.status === 1 && product.stock > 0));
    } catch {
      Swal.fire({ title: 'Error', text: t('productLoadError'), icon: 'error', confirmButtonColor: '#4f46e5' });
    } finally {
      setIsLoading(false);
    }
  };

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * (productsById.get(item.productId)?.price ?? 0), 0),
    [items, productsById],
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

  const syncItems = () => {
    setItems(guestCartService.getItems());
  };

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

  const addItem = (product: Product) => {
    guestCartService.addItem(product.id, getDesiredQuantity(product));
    setDesiredQuantity(product.id, '1');
    syncItems();
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const product = productsById.get(productId);
    if (!product) return;
    guestCartService.updateItem(productId, Math.min(quantity, product.stock));
    syncItems();
  };

  const commitItemQuantity = (productId: number) => {
    const product = productsById.get(productId);
    if (!product) return;

    const rawValue = itemQuantities[productId] ?? '';
    const parsedValue = Number(rawValue);
    if (!rawValue.trim() || Number.isNaN(parsedValue)) {
      setItemQuantities((current) => ({ ...current, [productId]: '1' }));
      updateQuantity(productId, 1);
      return;
    }

    updateQuantity(productId, Math.max(1, Math.min(parsedValue, product.stock)));
  };

  const updateDraft = (nextDraft: { paymentMethod?: string; description?: string }) => {
    guestCartService.saveDraft(nextDraft);
    if (typeof nextDraft.paymentMethod === 'string') setPaymentMethod(nextDraft.paymentMethod);
    if (typeof nextDraft.description === 'string') setDescription(nextDraft.description);
  };

  const handleSaveCart = async () => {
    if (!authService.getToken()) {
      guestCartService.setPostLoginRedirect('/dashboard/cart');
      router.push('/login');
      return;
    }

    try {
      setIsSyncing(true);
      await cartSyncService.syncGuestCartToBackend();
      Swal.fire({
        title: t('savedTitle'),
        text: t('savedMessage'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
      });
      router.push('/dashboard/cart');
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error?.message || t('syncError'),
        icon: 'error',
        confirmButtonColor: '#4f46e5',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/" className={styles.brandLink}>ProjectJ</Link>
        <div className={styles.topBarActions}>
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>

      <header className={styles.hero}>
        <div>
          <h1>{t('publicTitle')}</h1>
          <p className={styles.subtitle}>{t('publicSubtitle')}</p>
          <p className={styles.helperText}>{t('guestNotice')}</p>
        </div>
        <div className={styles.heroActions}>
          <Link href={hasToken ? '/dashboard/cart' : '/login'} className={styles.secondaryCta}>
            <LogIn size={18} /> {hasToken ? t('goToMyCart') : t('login')}
          </Link>
          <button className={styles.primaryCta} onClick={() => void handleSaveCart()} disabled={items.length === 0 || isSyncing}>
            <ShoppingCart size={18} />
            {isSyncing ? t('savingCart') : t('saveCart')}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.catalogSection}>
          <div className={styles.sectionHeader}>
            <h2><Store size={20} /> {t('catalog')}</h2>
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
                        <label className={styles.quantityLabel} htmlFor={`public-product-${product.id}`}>
                          {t('quantityShort')}
                        </label>
                        <input
                          id={`public-product-${product.id}`}
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
                        />
                      </div>
                      <button className={styles.addButton} onClick={() => addItem(product)}>
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
            <span>{t('items', { count: items.reduce((s, i) => s + i.quantity, 0) })}</span>
          </div>

          <div className={styles.metadataPanel}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('paymentMethod')}</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => updateDraft({ paymentMethod: event.target.value })}
                  className={styles.selectInput}
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
                  onChange={(event) => updateDraft({ description: event.target.value })}
                  className={styles.textArea}
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                />
              </label>
            </div>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>{t('emptyPublic')}</div>
          ) : (
            <div className={styles.cartList}>
              {items.map((item) => {
                const product = productsById.get(item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className={styles.cartItem}>
                    {/* Thumbnail */}
                    <div className={styles.cartItemThumb}>
                      {product.image
                        ? <img src={product.image} alt={product.name} className={styles.cartItemThumbImg} />
                        : <span className={styles.cartItemThumbPlaceholder}>🛍️</span>
                      }
                    </div>

                    <div className={styles.cartItemInfo}>
                      <strong>{product.name}</strong>
                      <p className={styles.cartItemPrice}>{formatCurrency(product.price * item.quantity)}</p>
                    </div>

                    <div className={styles.itemControls}>
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus size={13} /></button>
                      <input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={itemQuantities[item.productId] ?? String(item.quantity)}
                        onChange={(event) => setItemQuantities((current) => ({ ...current, [item.productId]: event.target.value }))}
                        onBlur={() => commitItemQuantity(item.productId)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            commitItemQuantity(item.productId);
                          }
                        }}
                        className={styles.itemQuantityInput}
                        aria-label={t('quantity')}
                      />
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus size={13} /></button>
                      <button className={styles.deleteBtn} onClick={() => updateQuantity(item.productId, 0)}>
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
              <span>{t('subtotal', { count: items.reduce((s, i) => s + i.quantity, 0) })}</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>{t('total')}</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <button className={styles.primaryFull} onClick={() => void handleSaveCart()} disabled={items.length === 0 || isSyncing}>
              {hasToken ? t('saveInAccount') : t('loginToSave')}
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
                  />
                  <button
                    className={styles.addButton}
                    style={{ flex: 1 }}
                    onClick={() => { addItem(selectedProduct); setSelectedProduct(null); }}
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
  );
}