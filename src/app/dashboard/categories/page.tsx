'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { CategoryModal } from '@/modules/categories/components/CategoryModal';
import { categoryService } from '@/modules/categories/services/category.service';
import { Category, CategoryRequest } from '@/modules/categories/types/category.types';
import styles from './page.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (categoryData: CategoryRequest) => {
    try {
      if (selectedCategory) {
        await categoryService.update(selectedCategory.id, categoryData);
        Swal.fire({
          title: '¡Actualizado!',
          text: 'La categoría ha sido actualizada correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await categoryService.create(categoryData);
        Swal.fire({
          title: '¡Creado!',
          text: 'La categoría ha sido creada correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar la categoría',
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
      await categoryService.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'La categoría ha sido eliminada correctamente',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la categoría',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (category: Category) => {
    setUpdatingStatus(category.id);
    try {
      const newStatus = category.status === 1 ? 0 : 1;
      await categoryService.updateStatus(category.id, category.status);
      await loadCategories();
      
      Swal.fire({
        title: '¡Actualizado!',
        text: `Categoría ${newStatus === 1 ? 'activada' : 'desactivada'} correctamente`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado de la categoría',
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
            <h1 className={styles.title}>Gestión de Categorías</h1>
            <p className={styles.subtitle}>Administra las categorías de productos</p>
          </div>
          <button className={styles.createButton} onClick={handleCreate}>
            + Nueva Categoría
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Cargando categorías...</div>
        ) : categories.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay categorías registradas</p>
            <button className={styles.createButton} onClick={handleCreate}>
              Crear primera categoría
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
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td className={styles.categoryName}>{category.name}</td>
                    <td className={styles.description}>
                      {category.description || '-'}
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <label className={styles.statusToggle}>
                          <input
                            type="checkbox"
                            checked={category.status === 1}
                            onChange={() => handleStatusToggle(category)}
                            disabled={updatingStatus === category.id}
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <span
                          className={`${styles.status} ${
                            category.status === 1 ? styles.active : styles.inactive
                          }`}
                        >
                          {category.status === 1 ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.date}>{formatDate(category.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => handleEdit(category)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(category.id)}
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

        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          category={selectedCategory}
        />
      </div>
    </DashboardLayout>
  );
}
