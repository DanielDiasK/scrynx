import { useI18n } from "../i18n";

export function HowItWorks() {
  const { t } = useI18n();

  return (
    <section className="border-y border-line/70 bg-card-2/60 py-16 sm:py-20 dark:bg-card/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl">
            {t.how.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {t.how.steps.map((step, i) => (
            <div key={i} className="card relative p-6 pt-8">
              <span
                aria-hidden="true"
                className="absolute right-5 top-4 font-display text-6xl font-extrabold opacity-15"
              >
                {i + 1}
              </span>
              <h3 className="text-[16px] font-extrabold leading-snug tracking-tight">
                {i === 0 ? (
                  <>
                    {step.title.split("Ctrl+Shift+S")[0]}
                    <kbd className="kbd mx-0.5 align-baseline">Ctrl</kbd>+
                    <kbd className="kbd align-baseline">Shift</kbd>+
                    <kbd className="kbd align-baseline">S</kbd>
                    {step.title.split("Ctrl+Shift+S")[1]}
                  </>
                ) : (
                  step.title
                )}
              </h3>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
