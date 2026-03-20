'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import styles from './LanguageSelector.module.css';

export const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    // Set cookie for locale
    document.cookie = `NEXT_LOCALE=${langCode}; path=/; max-age=31536000`; // 1 year
    
    // Force a full page reload to apply new locale
    window.location.reload();
  };

  return (
    <div className={styles.languageSelector}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.languageButton}
        aria-label="Select language"
      >
        <span className={styles.flag}>{currentLanguage.flag}</span>
        <span className={styles.code}>{currentLanguage.code.toUpperCase()}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className={styles.overlay} 
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdown}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`${styles.languageOption} ${
                  language.code === locale ? styles.active : ''
                }`}
              >
                <span className={styles.optionFlag}>{language.flag}</span>
                <span className={styles.optionName}>{language.name}</span>
                {language.code === locale && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
