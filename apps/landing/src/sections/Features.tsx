import {
  Scan,
  PenLine,
  ScanText,
  LayoutDashboard,
  Keyboard,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "../i18n";

const icons = [Scan, PenLine, ScanText, LayoutDashboard, Keyboard, ShieldCheck];
const chips = [
  "bg-gold text-[#16130c]",
  "bg-purple text-white",
  "bg-lime text-[#1a2410]",
  "bg-coral text-white",
  "bg-foreground text-background",
  "bg-positive text-[#0d2415]",
];

export function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow">{t.features.eyebrow}</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
              {t.features.title}
            </h2>
            <p className="mt-4 max-w-md text-[15px] font-medium leading-relaxed text-muted-foreground">
              {t.features.sub}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.features.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="group card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 ${chips[i]}`}
                >
                  <Icon size={21} strokeWidth={2.1} />
                </div>
                <h3 className="mt-5 text-[17px] font-extrabold leading-snug tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
