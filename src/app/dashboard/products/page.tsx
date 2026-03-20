'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  Package, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  Factory,
  BarChart2
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { ProductModal } from '@/modules/products/components/ProductModal';
import { productService } from '@/modules/products/services/product.service';
import { Product, ProductRequest } from '@/modules/products/types/product.types';
import styles from './page.module.css';

export default function ProductsPage() {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
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
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (productData: ProductRequest) => {
    try {
      if (selectedProduct) {
        // Actualizar
        await productService.update(selectedProduct.id, productData);
        Swal.fire({
          title: t('updated'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        // Crear
        await productService.create(productData);
        Swal.fire({
          title: t('created'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      await loadProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
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
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      
      Swal.fire({
        title: t('deleted'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting product:', error);
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
    const statusText = newStatus === 1 ? tCommon('active') : tCommon('inactive');
    
    try {
      setUpdatingStatus(id);
      await productService.updateStatus(id, currentStatus);
      
      // Actualizar el producto en la lista
      setProducts(products.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

      // Mostrar mensaje de éxito con el estado actual
      Swal.fire({
        title: t('statusUpdated'),
        html: `${t('product')} <strong>${statusText}</strong>`,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStockClass = (stock: number) => {
    if (stock === 0) return styles.outOfStock;
    if (stock < 10) return styles.lowStock;
    return styles.inStock;
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return t('outOfStock');
    if (stock < 10) return `${t('lowStock')} (${stock})`;
    return stock;
  };

  return (
    <DashboardLayout>
      <div className={styles.productsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><Package size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>{t('createNew')}</span>
          </button>
        </div>

        <div className={styles.productsCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>{t('noData')}</h3>
              <p>{t('createFirst')}</p>
              <button className={styles.addButton} onClick={handleCreate} style={{ marginTop: '1rem', margin: '0 auto' }}>
                <Plus size={18} /> {t('createNew')}
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th><ImageIcon size={16} /> {t('image')}</th>
                    <th>{t('name')}</th>
                    <th><Tag size={16} /> {t('category')}</th>
                    <th><Factory size={16} /> {t('brand')}</th>
                    <th>{t('price')}</th>
                    <th><BarChart2 size={16} /> {t('stock')}</th>
                    <th>{tCommon('status')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={styles.productImage}
                          />
                        ) : (
                          <div className={styles.productImage}>
                            <Package size={24} style={{ opacity: 0.5 }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.productName}>{product.name}</div>
                        <div className={styles.productCode}>{product.code}</div>
                      </td>
                      <td>{product.categoryName || '-'}</td>
                      <td>{product.brandName || '-'}</td>
                      <td className={styles.price}>{formatPrice(product.price)}</td>
                      <td>
                        <span className={`${styles.stock} ${getStockClass(product.stock)}`}>
                          {getStockLabel(product.stock)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <label className={styles.statusToggle}>
                            <input
                              type="checkbox"
                              checked={product.status === 1}
                              onChange={() => handleStatusToggle(product.id, product.status)}
                              disabled={updatingStatus === product.id}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span
                            className={`${styles.status} ${
                              product.status === 1 ? styles.active : styles.inactive
                            }`}
                          >
                            {product.status === 1 ? tCommon('active') : tCommon('inactive')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(product)}
                            title={tCommon('edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(product.id)}
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

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          product={selectedProduct}
        />
      </div>
    </DashboardLayout>
  );
}
