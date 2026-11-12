import { useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "../i18n";

export function Pricing() {
  const { t } = useI18n();
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-24 border-t border-line/70 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">{t.pricing.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            {t.pricing.title}
          </h2>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-muted-foreground">
            {t.pricing.sub}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full bg-card-2 p-1">
            <button
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
              className={`rounded-full px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                !annual ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.pricing.monthly}
            </button>
            <button
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
                annual ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.pricing.annual}
              <span className="rounded-full bg-positive/25 px-1.5 text-[9px] font-black text-positive">-2M</span>
            </button>
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
          {t.pricing.plans.map((plan, i) => {
            const highlighted = i === 1;
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-7 ${
                  highlighted
                    ? "bg-gradient-to-br from-[#8b63f2] via-[#7a4fe8] to-[#5b3ac9] text-white shadow-[var(--shadow)]"
                    : "card"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gold px-3.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#16130c] shadow-[var(--shadow-sm)]">
                    {t.pricing.mostPopular}
                  </span>
                )}
                <h3 className="text-2xl font-extrabold tracking-tight">{plan.name}</h3>
                <p
                  className={`mt-1 text-[12px] font-semibold ${
                    highlighted ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.desc}
                </p>
                <div className="mt-6 flex items-end gap-2 border-b border-current/15 pb-5">
                  <span className="font-display text-6xl font-extrabold leading-none tracking-tight">
                    ${price}
                  </span>
                  <span
                    className={`pb-1 font-mono text-[9.5px] font-bold uppercase leading-tight ${
                      highlighted ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {price === 0
                      ? t.pricing.forever
                      : i === 2
                        ? t.pricing.perUserMonth
                        : t.pricing.perMonth}
                  </span>
                </div>

                <a
                  href="https://github.com/DanielDiasK/scrynx/releases/latest"
                  className={`btn mt-6 w-full justify-center rounded-2xl px-4 py-3.5 text-[12px] uppercase tracking-wide ${
                    highlighted ? "btn-gold" : "btn-tonal"
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-[12.5px] font-medium leading-snug"
                    >
                      <span
                        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                          highlighted ? "bg-white/20" : "bg-positive/20"
                        }`}
                      >
                        <Check
                          size={11}
                          strokeWidth={4}
                          className={highlighted ? "text-white" : "text-positive"}
                        />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
          {t.pricing.footnote}
        </p>
      </div>
    </section>
  );
}
