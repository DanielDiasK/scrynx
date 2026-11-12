import { useI18n } from "../i18n";
import type { Lang } from "../locales";

const options: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
];

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language / Idioma"
      className="flex items-center gap-0.5 rounded-full bg-card-2 p-1"
    >
      {options.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest transition-colors ${
            lang === code
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
