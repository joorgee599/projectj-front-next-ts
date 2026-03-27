'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations('navbar');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.skeleton}></div>;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={styles.themeToggle}
      aria-label={t('theme')}
      title={t('theme')}
    >
      {theme === 'dark' ? (
        <Sun size={18} className={styles.icon} />
      ) : (
        <Moon size={18} className={styles.icon} />
      )}
    </button>
  );
};
