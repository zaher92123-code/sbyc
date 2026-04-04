"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Lang, TranslationKey } from "./translations";
import { T } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => T[key].en,
  isAr: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("al-seeb-lang") as Lang | null;
    if (saved === "en" || saved === "ar") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("al-seeb-lang", l);
    // Set cookie so server components can also read the language
    document.cookie = `al-seeb-lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("lang", l);
  }

  function t(key: TranslationKey): string {
    return T[key]?.[lang] ?? T[key]?.en ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
