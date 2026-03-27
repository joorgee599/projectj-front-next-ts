'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import styles from './page.module.css';

export default function LoginPage() {
  const t = useTranslations('auth');

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>ProjectJ</h1>
          <p className={styles.subtitle}>{t('welcomeBack')}</p>
        </div>
        
        <LoginForm />

        <div className={styles.secondaryAction}>
          <span className={styles.secondaryText}>{t('shopIntro')}</span>
          <Link href="/comprar" className={styles.secondaryLink}>{t('shopCta')}</Link>
        </div>
      </div>
    </div>
  );
}
