import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language || 'en';
  const isRTL = currentLanguage === 'ar';

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Update font for Arabic
    if (isRTL) {
      document.body.style.fontFamily = "'Cairo', 'Poppins', sans-serif";
    } else {
      document.body.style.fontFamily = "'Poppins', sans-serif";
    }
  }, [currentLanguage, isRTL]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return {
    currentLanguage,
    isRTL,
    changeLanguage,
    toggleLanguage,
  };
};

export default useLanguage;