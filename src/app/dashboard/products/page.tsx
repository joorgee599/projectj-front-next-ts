'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { ProductModal } from '@/modules/products/components/ProductModal';
import { productService } from '@/modules/products/services/product.service';
import { Product, ProductRequest } from '@/modules/products/types/product.types';
import styles from './page.module.css';

export default function ProductsPage() {
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
    if (selectedProduct) {
      // Actualizar
      await productService.update(selectedProduct.id, productData);
    } else {
      // Crear
      await productService.create(productData);
    }
    await loadProducts();
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await productService.delete(id);
      setProducts(products.filter(p => p.id !== id));
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El producto ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? 'Activo' : 'Inactivo';
    
    try {
      setUpdatingStatus(id);
      await productService.updateStatus(id, currentStatus);
      
      // Actualizar el producto en la lista
      setProducts(products.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

      // Mostrar mensaje de éxito con el estado actual
      Swal.fire({
        title: '¡Estado actualizado!',
        html: `El producto ahora está <strong>${statusText}</strong>`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del producto',
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
    if (stock === 0) return 'Sin stock';
    if (stock < 10) return `Bajo (${stock})`;
    return stock;
  };

  return (
    <DashboardLayout>
      <div className={styles.productsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1>📦 Productos</h1>
            <p>Gestiona tu catálogo de productos</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <span>➕</span>
            <span>Nuevo Producto</span>
          </button>
        </div>

        <div className={styles.productsCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No hay productos</h3>
              <p>Comienza agregando tu primer producto</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.productsTable}>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Marca</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
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
                          <div className={styles.productImage}>📦</div>
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
                            {product.status === 1 ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(product)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(product.id)}
                            title="Eliminar"
                          >
                            🗑️
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
