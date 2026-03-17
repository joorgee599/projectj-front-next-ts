'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/core/design-system/Button';
import { Input } from '@/core/design-system/Input';
import { authService } from '../services/auth.service';
import styles from './LoginForm.module.css';

export const LoginForm: React.FC = () => {
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
      await authService.login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={`${styles.form} glass-card`} onSubmit={handleSubmit}>
      <h1 className={styles.title}>Welcome Back</h1>
      <p className={styles.subtitle}>Enter your credentials to continue</p>
      
      <Input 
        type="email"
        label="Email" 
        placeholder="e.g. jdoe@example.com" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input 
        type="password"
        label="Password" 
        placeholder="Enter your password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <div className={styles.error}>{error}</div>}

      <Button type="submit" loading={loading} className={styles.submit}>
        Sign In
      </Button>
    </form>
  );
};
