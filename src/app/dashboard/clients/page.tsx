'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Swal from 'sweetalert2';
import { 
  UserCheck, 
  Plus, 
  Pencil, 
  Trash2, 
  FileText, 
  Mail, 
  Phone 
} from 'lucide-react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';
import { ClientModal } from '@/modules/clients/components/ClientModal';
import { clientService } from '@/modules/clients/services/client.service';
import { Client, ClientRequest } from '@/modules/clients/types/client.types';
import styles from './page.module.css';

export default function ClientsPage() {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
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
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSubmit = async (clientData: ClientRequest) => {
    try {
      if (selectedClient) {
        await clientService.update(selectedClient.id, clientData);
        Swal.fire({
          title: t('updated'),
          text: t('updatedSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      } else {
        await clientService.create(clientData);
        Swal.fire({
          title: t('created'),
          text: t('createdSuccess'),
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
      setIsModalOpen(false);
      await loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
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
      await clientService.delete(id);
      setClients(clients.filter(c => c.id !== id));
      
      Swal.fire({
        title: t('deleted'),
        text: t('deletedSuccess'),
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      Swal.fire({
        title: tCommon('error'),
        text: t('errorDeleting'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const handleStatusToggle = async (client: Client) => {
    const newStatus = client.status === 1 ? 0 : 1;
    setUpdatingStatus(client.id);
    try {
      await clientService.updateStatus(client.id, newStatus);
      
      setClients(clients.map(c => 
        c.id === client.id ? { ...c, status: newStatus } : c
      ));
      
      Swal.fire({
        title: t('statusUpdated'),
        text: `${t('client')} ${newStatus === 1 ? tCommon('active') : tCommon('inactive')}`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        title: tCommon('error'),
        text: tCommon('error'),
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.clientsPage}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1><UserCheck size={28} className={styles.titleIcon} /> {t('title')}</h1>
            <p>{t('subtitle')}</p>
          </div>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>{t('createNew')}</span>
          </button>
        </div>

        <div className={styles.clientsCard}>
          {isLoading ? (
            <div className={styles.loading}>
              <p>{tCommon('loading')}</p>
            </div>
          ) : clients.length === 0 ? (
            <div className={styles.emptyState}>
              <UserCheck size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>{t('noData')}</h3>
              <button className={styles.addButton} onClick={handleCreate} style={{ marginTop: '1rem', margin: '0 auto' }}>
                <Plus size={18} /> {t('createFirst')}
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.clientsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('name')}</th>
                    <th><Mail size={16} /> {t('email')}</th>
                    <th><FileText size={16} /> {t('document')}</th>
                    <th><Phone size={16} /> {t('phone')}</th>
                    <th>{tCommon('status')}</th>
                    <th>{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td className={styles.clientName}>{client.name}</td>
                      <td className={styles.email}>{client.email}</td>
                      <td>{client.document}</td>
                      <td>{client.phone}</td>
                      <td>
                        <div className={styles.statusCell}>
                          <label className={styles.statusToggle}>
                            <input
                              type="checkbox"
                              checked={client.status === 1}
                              onChange={() => handleStatusToggle(client)}
                              disabled={updatingStatus === client.id}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <span
                            className={`${styles.status} ${
                              client.status === 1 ? styles.active : styles.inactive
                            }`}
                          >
                            {client.status === 1 ? tCommon('active') : tCommon('inactive')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => handleEdit(client)}
                            title={tCommon('edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(client.id)}
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

        <ClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          client={selectedClient}
        />
      </div>
    </DashboardLayout>
  );
}
