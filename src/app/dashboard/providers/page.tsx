'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { ProviderModal } from '@/modules/providers/components/ProviderModal';
import { providerService } from '@/modules/providers/services/provider.service';
import { Provider, ProviderRequest } from '@/modules/providers/types/provider.types';
import styles from './page.module.css';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      const data = await providerService.getAll();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los proveedores',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedProvider(null);
    setIsModalOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const handleSubmit = async (providerData: ProviderRequest) => {
    try {
      if (selectedProvider) {
        await providerService.update(selectedProvider.id, providerData);
        Swal.fire({
          title: '¡Actualizado!',
          text: 'El proveedor ha sido actualizado correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await providerService.create(providerData);
        Swal.fire({
          title: '¡Creado!',
          text: 'El proveedor ha sido creado correctamente',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      await loadProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar el proveedor',
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
      await providerService.delete(id);
      setProviders(providers.filter(p => p.id !== id));
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El proveedor ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el proveedor',
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
      await providerService.updateStatus(id, currentStatus);
      
      setProviders(providers.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

      Swal.fire({
        title: '¡Estado actualizado!',
        html: `El proveedor ahora está <strong>${statusText}</strong>`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el estado del proveedor',
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
            <h1 className={styles.title}>Gestión de Proveedores</h1>
            <p className={styles.subtitle}>Administra los proveedores del sistema</p>
          </div>
          <button className={styles.createButton} onClick={handleCreate}>
            + Nuevo Proveedor
          </button>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Cargando proveedores...</div>
        ) : providers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay proveedores registrados</p>
            <button className={styles.createButton} onClick={handleCreate}>
              Crear primer proveedor
            </button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id}>
                    <td>{provider.id}</td>
                    <td className={styles.providerName}>{provider.name}</td>
                    <td>{provider.contactName || '-'}</td>
                    <td className={styles.email}>{provider.email}</td>
                    <td>{provider.phone}</td>
                    <td>
                      <div className={styles.statusCell}>
                        <label className={styles.statusToggle}>
                          <input
                            type="checkbox"
                            checked={provider.status === 1}
                            onChange={() => handleStatusToggle(provider.id, provider.status)}
                            disabled={updatingStatus === provider.id}
                          />
                          <span className={styles.slider}></span>
                        </label>
                        <span
                          className={`${styles.status} ${
                            provider.status === 1 ? styles.active : styles.inactive
                          }`}
                        >
                          {provider.status === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.date}>{formatDate(provider.createdAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.editButton}`}
                          onClick={() => handleEdit(provider)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(provider.id)}
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

        <ProviderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          provider={selectedProvider}
        />
      </div>
    </DashboardLayout>
  );
}
