import { Check, Download } from "lucide-react";
import { useI18n } from "../i18n";
import { AppMock } from "../components/AppMock";

export function ManagerSection() {
  const { t } = useI18n();

  return (
    <section id="manager" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="eyebrow">{t.manager.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            {t.manager.title}
          </h2>
          <p className="mt-4 text-[15px] font-medium leading-relaxed text-muted-foreground">
            {t.manager.sub}
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <ul className="space-y-3">
            {t.manager.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-positive">
                  <Check size={13} strokeWidth={4} className="text-[#0d2415]" />
                </span>
                <span className="text-[14.5px] font-medium leading-relaxed">{b}</span>
              </li>
            ))}
            <li className="pt-3">
              <a href="https://github.com/DanielDiasK/scrynx/releases/latest" className="btn btn-gold h-14 rounded-2xl px-7 text-[15px]">
                <Download size={19} strokeWidth={2.6} />
                {t.manager.cta}
              </a>
            </li>
          </ul>

          <AppMock className="shadow-[var(--shadow)]" />
        </div>
      </div>
    </section>
  );
}
