import {
  createContext,
  useCallback,
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
  return typeof navigator !== "undefined" &&
    navigator.language?.toLowerCase().startsWith("pt")
    ? "pt"
    : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("scrynx-lang", l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l === "pt" ? "pt-BR" : "en";
  }, []);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: locales[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
