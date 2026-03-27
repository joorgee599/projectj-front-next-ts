'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { Inventory, InventoryDetailRequest, MovementType } from '../types/inventory.types';
import { productService } from '@/modules/products/services/product.service';
import { Product } from '@/modules/products/types/product.types';
import { providerService } from '@/modules/providers/services/provider.service';
import { Provider } from '@/modules/providers/types/provider.types';
import styles from './InventoryModal.module.css';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { description?: string; document?: string; details: InventoryDetailRequest[] }) => Promise<void>;
  inventory?: Inventory | null;
}

const MOVEMENT_TYPES: MovementType[] = ['ENTRADA', 'SALIDA', 'AJUSTE'];

const emptyDetail = (): InventoryDetailRequest => ({
  productId: 0,
  type: 'ENTRADA',
  quantity: 1,
  unitCost: undefined,
  providerId: undefined,
});

const buildDraftRow = (detail?: InventoryDetailRequest) => ({
  quantity: String(detail?.quantity ?? 1),
  unitCost: detail?.unitCost == null ? '' : String(detail.unitCost),
});

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inventory,
}) => {
  const t = useTranslations('inventory');
  const tCommon = useTranslations('common');

  const [description, setDescription] = useState('');
  const [document, setDocument] = useState('');
  const [details, setDetails] = useState<InventoryDetailRequest[]>([emptyDetail()]);
  const [detailDrafts, setDetailDrafts] = useState<Array<{ quantity: string; unitCost: string }>>([buildDraftRow()]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    productService.getAll().then(setProducts).catch(console.error);
    providerService.getAll().then(setProviders).catch(console.error);
  }, []);

  useEffect(() => {
    if (inventory) {
      setDescription(inventory.description || '');
      setDocument(inventory.document || '');
      setDetails(
        inventory.details?.length
          ? inventory.details.map(d => ({
              productId: d.productId,
              type: d.type,
              quantity: d.quantity,
              unitCost: d.unitCost,
              providerId: d.providerId,
            }))
          : [emptyDetail()]
      );
      setDetailDrafts(
        inventory.details?.length
          ? inventory.details.map(d => buildDraftRow({
              productId: d.productId,
              type: d.type,
              quantity: d.quantity,
              unitCost: d.unitCost,
              providerId: d.providerId,
            }))
          : [buildDraftRow()]
      );
    } else {
      setDescription('');
      setDocument('');
      setDetails([emptyDetail()]);
      setDetailDrafts([buildDraftRow()]);
    }
    setErrors({});
  }, [inventory, isOpen]);

  const addDetail = () => {
    setDetails(prev => [...prev, emptyDetail()]);
    setDetailDrafts(prev => [...prev, buildDraftRow()]);
  };

  const removeDetail = (index: number) => {
    setDetails(prev => prev.filter((_, i) => i !== index));
    setDetailDrafts(prev => prev.filter((_, i) => i !== index));
  };

  const updateDetail = (index: number, field: keyof InventoryDetailRequest, value: unknown) => {
    setDetails(prev =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const updateDetailDraft = (index: number, field: 'quantity' | 'unitCost', value: string) => {
    setDetailDrafts(prev => prev.map((draft, i) => (i === index ? { ...draft, [field]: value } : draft)));
  };

  const commitDetailDraft = (index: number, field: 'quantity' | 'unitCost') => {
    const draft = detailDrafts[index];
    if (!draft) return;

    if (field === 'quantity') {
      const parsed = Number(draft.quantity);
      const quantity = !draft.quantity.trim() || Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
      updateDetail(index, 'quantity', quantity);
      updateDetailDraft(index, 'quantity', String(quantity));
      return;
    }

    if (!draft.unitCost.trim()) {
      updateDetail(index, 'unitCost', undefined);
      updateDetailDraft(index, 'unitCost', '');
      return;
    }

    const parsed = Number(draft.unitCost);
    if (Number.isNaN(parsed)) {
      updateDetail(index, 'unitCost', undefined);
      updateDetailDraft(index, 'unitCost', '');
      return;
    }

    updateDetail(index, 'unitCost', parsed);
    updateDetailDraft(index, 'unitCost', String(parsed));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (details.length === 0) {
      newErrors.details = t('detailsRequired');
    }
    details.forEach((d, i) => {
      if (!d.productId) newErrors[`product_${i}`] = t('productRequired');
      if (!d.quantity || d.quantity <= 0) newErrors[`qty_${i}`] = t('quantityRequired');
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSubmit({ description, document, details });
      onClose();
    } catch (error) {
      console.error('Error submitting inventory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{inventory ? t('editInventory') : t('createNew')}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Header fields */}
          <div className={styles.headerFields}>
            <div className={styles.formGroup}>
              <label>{t('description')}</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isSubmitting}
                placeholder={t('description')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('document')}</label>
              <input
                type="text"
                value={document}
                onChange={e => setDocument(e.target.value)}
                disabled={isSubmitting}
                placeholder="DOC-001"
              />
            </div>
          </div>

          {/* Details table */}
          <div className={styles.detailsSection}>
            <div className={styles.detailsHeader}>
              <label className={styles.detailsLabel}>{t('details')}</label>
              <button
                type="button"
                className={styles.addDetailBtn}
                onClick={addDetail}
                disabled={isSubmitting}
              >
                <Plus size={14} /> {t('addDetail')}
              </button>
            </div>
            {errors.details && <span className={styles.error}>{errors.details}</span>}

            <div className={styles.detailsTable}>
              <div className={styles.tableHead}>
                <span>{t('product')}</span>
                <span>{t('movementType')}</span>
                <span>{t('quantity')}</span>
                <span>{t('unitCost')}</span>
                <span>{t('provider')}</span>
                <span></span>
              </div>

              {details.map((detail, i) => (
                <div key={i} className={styles.tableRow}>
                  <div className={styles.cellGroup}>
                    <select
                      value={detail.productId || ''}
                      onChange={e => updateDetail(i, 'productId', Number(e.target.value))}
                      className={errors[`product_${i}`] ? styles.inputError : ''}
                      disabled={isSubmitting}
                    >
                      <option value="">{t('selectProduct')}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    {errors[`product_${i}`] && (
                      <span className={styles.error}>{errors[`product_${i}`]}</span>
                    )}
                  </div>

                  <div className={styles.cellGroup}>
                    <select
                      value={detail.type}
                      onChange={e => updateDetail(i, 'type', e.target.value as MovementType)}
                      disabled={isSubmitting}
                    >
                      {MOVEMENT_TYPES.map(mt => (
                        <option key={mt} value={mt}>{t(`type${mt}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.cellGroup}>
                    <input
                      type="number"
                      min={1}
                      value={detailDrafts[i]?.quantity ?? String(detail.quantity)}
                      onChange={e => updateDetailDraft(i, 'quantity', e.target.value)}
                      onBlur={() => commitDetailDraft(i, 'quantity')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitDetailDraft(i, 'quantity');
                        }
                      }}
                      className={errors[`qty_${i}`] ? styles.inputError : ''}
                      disabled={isSubmitting}
                    />
                    {errors[`qty_${i}`] && (
                      <span className={styles.error}>{errors[`qty_${i}`]}</span>
                    )}
                  </div>

                  <div className={styles.cellGroup}>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={detailDrafts[i]?.unitCost ?? (detail.unitCost == null ? '' : String(detail.unitCost))}
                      onChange={e => updateDetailDraft(i, 'unitCost', e.target.value)}
                      onBlur={() => commitDetailDraft(i, 'unitCost')}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          commitDetailDraft(i, 'unitCost');
                        }
                      }}
                      placeholder="0.00"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={styles.cellGroup}>
                    {detail.type === 'ENTRADA' ? (
                      <select
                        value={detail.providerId ?? ''}
                        onChange={e => updateDetail(i, 'providerId', e.target.value ? Number(e.target.value) : undefined)}
                        disabled={isSubmitting}
                      >
                        <option value="">{t('noProvider')}</option>
                        {providers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={styles.naCell}>—</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeDetail(i)}
                    disabled={isSubmitting || details.length === 1}
                    title={tCommon('delete')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
              {tCommon('cancel')}
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? tCommon('loading') : inventory ? tCommon('save') : tCommon('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
