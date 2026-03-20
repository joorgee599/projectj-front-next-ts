'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(t('invalidCredentials' as any) || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('loginFailed' as any) || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>ProjectJ</h1>
          <p className={styles.subtitle}>{t('welcomeBack')}</p>
        </div>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}
        
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
