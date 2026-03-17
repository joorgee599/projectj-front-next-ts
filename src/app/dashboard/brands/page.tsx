'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { BrandModal } from '@/modules/brands/components/BrandModal';
import { brandService } from '@/modules/brands/services/brand.service';
import { Brand, BrandRequest } from '@/modules/brands/types/brand.types';
import styles from './page.module.css';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las marcas',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleSubmit = async (brandData: BrandRequest) => {
    try {
      if (selectedBrand) {
        await brandService.update(selectedBrand.id, brandData);
        Swal.fire({
          title: '¡Actualizado!',
          text: 'La marca ha sido actualizada correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await brandService.create(brandData);
        Swal.fire({
          title: '¡Creado!',
          text: 'La marca ha sido creada correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      await loadBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar la marca',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
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
      await brandService.delete(id);
      setBrands(brands.filter(b => b.id !== id));
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'La marca ha sido eliminada correctamente',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la marca',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? 'Activa' : 'Inactiva';
    
    try {
      setUpdatingStatus(id);
      await brandService.updateStatus(id, currentStatus);
      
      setBrands(brands.map(b => 
        b.id === id ? { ...b, status: newStatus } : b
      ));

      Swal.fire({
        title: '¡Estado actualizado!',
        html: `La marca ahora está <strong>${statusText}</strong>`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado de la marca',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Marcas</h1>
            <p className={styles.subtitle}>Administra las marcas de productos</p>
          </div>
          <button className={styles.createButton} onClick={handleCreate}>
            + Nueva Marca
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Cargando marcas...</div>
        ) : brands.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay marcas registradas</p>
            <button className={styles.createButton} onClick={handleCreate}>
              Crear primera marca
            </button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.id}</td>
                    <td className={styles.brandName}>{brand.name}</td>
                    <td className={styles.description}>
                      {brand.description || '-'}
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <label className={styles.statusToggle}>
                          <input
                            type="checkbox"
                            checked={brand.status === 1}
                            onChange={() => handleStatusToggle(brand.id, brand.status)}
                            disabled={updatingStatus === brand.id}
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <span
                          className={`${styles.status} ${
                            brand.status === 1 ? styles.active : styles.inactive
                          }`}
                        >
                          {brand.status === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.date}>{formatDate(brand.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => handleEdit(brand)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(brand.id)}
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

        <BrandModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          brand={selectedBrand}
        />
      </div>
    </DashboardLayout>
  );
}
