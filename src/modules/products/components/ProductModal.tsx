import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon, Package } from 'lucide-react';
import { Product, ProductRequest, ProductSubmission } from '../types/product.types';
import { categoryService } from '@/modules/categories/services/category.service';
import { brandService } from '@/modules/brands/services/brand.service';
import { Category } from '@/modules/categories/types/category.types';
import { Brand } from '@/modules/brands/types/brand.types';
import styles from './ProductModal.module.css';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductSubmission) => Promise<void>;
  product?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
}) => {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    code: '',
    price: 0,
    image: '',
    categoryId: 0,
    brandId: 0,
    status: 1,
    stock: 0,
    minStock: 0,
    maxStock: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [numericDrafts, setNumericDrafts] = useState({
    price: '0',
    stock: '0',
    minStock: '0',
    maxStock: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const previewObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getAll(),
        brandService.getAll(),
      ]);
      const activeCategories = categoriesData.filter(c => c.status === 1);
      const activeBrands = brandsData.filter(b => b.status === 1);
      
      setCategories(activeCategories);
      setBrands(activeBrands);

      if (!product) {
        setFormData(prev => ({
          ...prev,
          categoryId: activeCategories.length > 0 ? activeCategories[0].id : 0,
          brandId: activeBrands.length > 0 ? activeBrands[0].id : 0,
        }));
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

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
        minStock: product.minStock ?? 0,
        maxStock: product.maxStock ?? undefined,
      });
      setNumericDrafts({
        price: String(product.price ?? 0),
        stock: String(product.stock ?? 0),
        minStock: String(product.minStock ?? 0),
        maxStock: product.maxStock == null ? '' : String(product.maxStock),
      });
      setPreviewUrl(product.image || '');
    } else {
      setFormData({
        name: '',
        description: '',
        code: '',
        price: 0,
        image: '',
        categoryId: categories.length > 0 ? categories[0].id : 0,
        brandId: brands.length > 0 ? brands[0].id : 0,
        status: 1,
        stock: 0,
        minStock: 0,
        maxStock: undefined,
      });
      setNumericDrafts({
        price: '0',
        stock: '0',
        minStock: '0',
        maxStock: '',
      });
      setPreviewUrl('');
    }
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setSelectedImageFile(null);
    setErrors({});
  }, [product, isOpen, categories, brands]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const buildPayload = (): ProductSubmission => ({
    ...formData,
    price: Number(numericDrafts.price || '0'),
    stock: Number(numericDrafts.stock || '0'),
    minStock: Number(numericDrafts.minStock || '0'),
    maxStock: numericDrafts.maxStock.trim() === '' ? undefined : Number(numericDrafts.maxStock),
    imageFile: selectedImageFile,
  });

  const validate = (data: ProductRequest): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) {
      newErrors.name = t('nameRequired');
    }

    if (!data.code.trim()) {
      newErrors.code = t('codeRequired');
    }

    if (data.price <= 0) {
      newErrors.price = t('priceRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = buildPayload();

    if (!validate(payload)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      onClose();
    } catch (error: any) {
      console.error('Error submitting:', error);
      setErrors({ submit: error.message || t('errorSaving') });
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
      [name]: ['categoryId', 'brandId', 'status'].includes(name)
        ? (value === '' ? undefined : Number(value))
        : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumericDraftChange = (field: keyof typeof numericDrafts, value: string) => {
    setNumericDrafts((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const commitNumericDraft = (field: keyof typeof numericDrafts) => {
    const value = numericDrafts[field];
    if (field === 'maxStock') {
      if (!value.trim()) {
        setNumericDrafts((prev) => ({ ...prev, maxStock: '' }));
        return;
      }
      const parsed = Number(value);
      setNumericDrafts((prev) => ({ ...prev, maxStock: Number.isNaN(parsed) ? '' : String(Math.max(0, parsed)) }));
      return;
    }

    const parsed = Number(value);
    const fallback = field === 'price' ? '0' : '0';
    setNumericDrafts((prev) => ({
      ...prev,
      [field]: !value.trim() || Number.isNaN(parsed) ? fallback : String(Math.max(0, parsed)),
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImageFile(file);

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      previewObjectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      return;
    }

    setPreviewUrl(product?.image || '');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {product ? `✏️ ${t('editProduct')}` : `➕ ${t('createNew')}`}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form id="product-form" onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t('name')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                placeholder={t('name')}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('description')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                placeholder={t('description')}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t('code')} <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.code ? styles.inputError : ''}`}
                  placeholder="LP-001"
                />
                {errors.code && <span className={styles.errorText}>{errors.code}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {t('price')} <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={numericDrafts.price}
                  onChange={(e) => handleNumericDraftChange('price', e.target.value)}
                  onBlur={() => commitNumericDraft('price')}
                  className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.price && <span className={styles.errorText}>{errors.price}</span>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{t('image')}</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageChange}
                className={styles.input}
              />
              <span className={styles.helperText}>{t('imageHelp')}</span>
              {selectedImageFile && (
                <span className={styles.helperText}>{selectedImageFile.name}</span>
              )}
              <div className={styles.previewCard}>
                <div className={styles.previewLabel}>
                  <ImageIcon size={16} />
                  <span>{t('imagePreview')}</span>
                </div>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={formData.name || t('imagePreview')}
                    className={styles.previewImage}
                  />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <Package size={28} />
                    <span>{t('noImage')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('category')}</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? (
                    <option value="">{tCommon('loading')}</option>
                  ) : categories.length === 0 ? (
                    <option value="">{t('noCategories') || 'No categories'}</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('brand')}</label>
                <select
                  name="brandId"
                  value={formData.brandId}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={isLoadingOptions}
                >
                  {isLoadingOptions ? (
                    <option value="">{tCommon('loading')}</option>
                  ) : brands.length === 0 ? (
                    <option value="">{t('noBrands') || 'No brands'}</option>
                  ) : (
                    brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('stock')}</label>
                <input
                  type="number"
                  name="stock"
                  value={numericDrafts.stock}
                  onChange={(e) => handleNumericDraftChange('stock', e.target.value)}
                  onBlur={() => commitNumericDraft('stock')}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{tCommon('status')}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={1}>{tCommon('active')}</option>
                  <option value={0}>{tCommon('inactive')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('minStock')}</label>
                <input
                  type="number"
                  name="minStock"
                  value={numericDrafts.minStock}
                  onChange={(e) => handleNumericDraftChange('minStock', e.target.value)}
                  onBlur={() => commitNumericDraft('minStock')}
                  className={styles.input}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('maxStock')}</label>
                <input
                  type="number"
                  name="maxStock"
                  value={numericDrafts.maxStock}
                  onChange={(e) => handleNumericDraftChange('maxStock', e.target.value)}
                  onBlur={() => commitNumericDraft('maxStock')}
                  className={styles.input}
                  placeholder="—"
                  min="0"
                />
              </div>
            </div>

            {errors.submit && (
              <div className={styles.errorMessage}>
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
            {tCommon('cancel')}
          </button>
          <button
            form="product-form"
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? tCommon('loading') : (product ? tCommon('save') : tCommon('create'))}
          </button>
        </div>
      </div>
    </div>
  );
};
