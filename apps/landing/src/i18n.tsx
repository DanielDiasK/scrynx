import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { locales, type Dict, type Lang } from "./locales";

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem("scrynx-lang");
    if (stored === "en" || stored === "pt") return stored;
  } catch {
    /* ignore */
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("scrynx-lang", l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  };

  const value: I18nContextValue = { lang, setLang, t: locales[lang] };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
