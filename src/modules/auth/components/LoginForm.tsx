import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/core/design-system/Button';
import { Input } from '@/core/design-system/Input';
import { authService } from '../services/auth.service';
import styles from './LoginForm.module.css';

export const LoginForm: React.FC<any> = ({ onSubmit: propOnSubmit }) => {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (propOnSubmit) {
        await propOnSubmit(email, password);
      } else {
        await authService.login({ email, password });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('enterCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`${styles.form} glass-card`} onSubmit={handleSubmit}>
      <h1 className={styles.title}>{t('login')}</h1>
      <p className={styles.subtitle}>{t('enterCredentials')}</p>
      
      <Input 
        type="email"
        label={t('email')} 
        placeholder="e.g. jdoe@example.com" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input 
        type="password"
        label={t('password')} 
        placeholder="••••••••" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button type="submit" loading={loading} className={styles.submit}>
        {t('login')}
      </Button>
    </form>
  );
};
