import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "../i18n";

export function Faq() {
  const { t } = useI18n();
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 border-b border-line/70 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="eyebrow">{t.faq.eyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            {t.faq.title}
          </h2>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-sm)]">
          {t.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={i > 0 ? "border-t border-line/70" : ""}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-card-2/60"
                >
                  <span className="text-[14.5px] font-extrabold leading-snug tracking-tight">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen ? "rotate-45 bg-gold text-[#16130c]" : "bg-card-2 text-muted-foreground"
                    }`}
                  >
                    <Plus size={16} strokeWidth={3} />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[13px] font-medium leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
