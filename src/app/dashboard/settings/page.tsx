'use client';

import React from 'react';
import { DashboardLayout } from '@/core/design-system/DashboardLayout';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
          ⚙️ Configuración
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          Ajusta las preferencias del sistema
        </p>
        
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p>Contenido de configuración en construcción...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
