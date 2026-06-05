import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { Language, translate } from '@/i18n/translations';

type TranslationContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>('fr');

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => translate(language, key),
    }),
    [language]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const value = useContext(TranslationContext);

  if (!value) {
    throw new Error('useTranslation must be used inside TranslationProvider');
  }

  return value;
}
