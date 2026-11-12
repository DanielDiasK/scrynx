import {
  Download,
  ArrowDown,
  Check,
  CheckCheck,
  PenLine,
  ArrowRight,
  Type,
  Eraser,
} from "lucide-react";
import { useI18n } from "../i18n";
import { AppMock } from "../components/AppMock";

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative overflow-hidden pt-16">
      {/* Soft ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle,hsl(var(--purple)/0.18),transparent_65%)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-52 bottom-40 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.16),transparent_65%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Copy */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground shadow-[var(--shadow-sm)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-positive" />
              {t.hero.badge}
            </div>

            <h1 className="mt-6 font-display text-[clamp(3rem,8.6vw,5.4rem)] font-extrabold leading-[0.97] tracking-tight">
              <span className="block">{t.hero.titleA}</span>
              <span className="block">{t.hero.titleB}</span>
              <span className="mt-2 inline-block rounded-2xl bg-gold px-4 text-[#16130c] shadow-[var(--shadow-sm)]">
                {t.hero.titleC}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] font-medium leading-relaxed text-muted-foreground">
              {t.hero.sub}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#download" className="btn btn-gold h-14 rounded-2xl px-6 text-[15px]">
                <Download size={19} strokeWidth={2.5} />
                <span className="leading-tight">
                  {t.hero.ctaPrimary}
                  <span className="block font-mono text-[9px] font-bold uppercase tracking-wider opacity-70">
                    {t.hero.ctaPrimaryNote}
                  </span>
                </span>
              </a>
              <a href="#manager" className="btn btn-tonal h-14 rounded-2xl px-6 text-[15px]">
                <ArrowDown size={19} strokeWidth={2.5} />
                {t.hero.ctaSecondary}
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <Check size={13} strokeWidth={3.5} className="text-positive" />
              {t.hero.micro}
            </p>
          </div>

          {/* App mock + floating bits */}
          <div className="relative lg:col-span-6">
            <div className="animate-float-soft">
              <AppMock />
            </div>

            {/* Floating annotation toolbar */}
            <div className="absolute -left-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-2xl bg-card p-1.5 shadow-[var(--shadow)] sm:flex">
              {[PenLine, ArrowRight, Type, Eraser].map((Icon, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-2 ${
                    i === 0 ? "bg-foreground text-background" : "text-muted-foreground"
                  }`}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>
              ))}
            </div>

            {/* Floating copied toast */}
            <div className="absolute -top-4 right-2 flex items-center gap-2.5 rounded-2xl bg-card py-2 pl-2 pr-4 shadow-[var(--shadow)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-positive">
                <CheckCheck size={16} strokeWidth={2.75} className="text-[#0d2415]" />
              </span>
              <span>
                <span className="block text-[11px] font-extrabold">{t.hero.toast}</span>
                <span className="block font-mono text-[8px] font-medium text-muted-foreground">
                  {t.hero.toastSub}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-line/70 bg-background/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
          {t.stats.map((s, i) => (
            <div
              key={i}
              className={`px-5 py-5 text-center sm:px-6 ${
                i > 0 ? "border-l border-line/70" : ""
              } ${i >= 2 ? "border-t border-line/70 lg:border-t-0" : ""}`}
            >
              <div className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-[10px] font-semibold leading-snug text-muted-foreground sm:text-[10.5px]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
