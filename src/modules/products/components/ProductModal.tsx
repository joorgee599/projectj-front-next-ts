'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductRequest } from '../types/product.types';
import styles from './ProductModal.module.css';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductRequest) => Promise<void>;
  product?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
}) => {
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    code: '',
    price: 0,
    image: '',
    categoryId: 1,
    brandId: 1,
    status: 1,
    stock: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        code: product.code,
        price: product.price,
        image: product.image || '',
        categoryId: product.categoryId,
        brandId: product.brandId,
        status: product.status,
        stock: product.stock,
      });
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      price: 0,
      image: '',
      categoryId: 1,
      brandId: 1,
      status: 1,
      stock: 0,
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error submitting:', error);
      setErrors({ submit: error.message || 'Error al guardar el producto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'categoryId' || name === 'brandId' || name === 'status'
        ? Number(value)
        : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nombre <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Ej: Laptop HP Pavilion"
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Descripción del producto..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Código <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="LP-001"
                />
                {errors.code && <span className={styles.error}>{errors.code}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Precio <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && <span className={styles.error}>{errors.price}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>URL de imagen</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={styles.input}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Categoría</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={1}>Electrónicos</option>
                  <option value={2}>Ropa</option>
                  <option value={3}>Alimentos</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Marca</label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={1}>HP</option>
                  <option value={2}>Dell</option>
                  <option value={3}>Logitech</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Estado</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            {errors.submit && (
              <div className={styles.error} style={{ textAlign: 'center' }}>
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};
