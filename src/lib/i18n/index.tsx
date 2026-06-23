'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { dictionaries, type Lang } from './dictionary';

const KEY = 'filmhere:lang';

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as Lang | null;
      if (saved && saved in dictionaries) {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      /* noop */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* noop */
    }
  }, []);

  const t = useCallback(
    (key: string) => dictionaries[lang]?.[key] ?? dictionaries.ko[key] ?? key,
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  // Provider 밖에서도 안전하게 동작(키 그대로 반환)
  if (!ctx) {
    return {
      lang: 'ko',
      setLang: () => {},
      t: (key: string) => dictionaries.ko[key] ?? key,
    };
  }
  return ctx;
}
