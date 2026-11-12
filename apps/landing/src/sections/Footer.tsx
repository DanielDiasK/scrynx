import { Download } from "lucide-react";
import { useI18n } from "../i18n";
import { LogoMark, Wordmark } from "../components/Logo";

export function Footer() {
  const { t, lang } = useI18n();

  const columns = [
    { title: t.footer.product, links: t.footer.productLinks },
    { title: t.footer.resources, links: t.footer.resourceLinks },
    { title: t.footer.legal, links: t.footer.legalLinks },
  ];

  return (
    <>
      {/* Final CTA — purple fintech band */}
      <section id="download" className="scroll-mt-24 bg-[#14141c] py-16 text-center sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="eyebrow !text-white/40">
            [ {t.finalCta.micro} ]
          </span>
          <h2 className="mx-auto mt-4 font-display text-4xl font-extrabold leading-[0.97] tracking-tight text-white sm:text-6xl">
            {t.finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] font-medium text-white/60">
            {t.finalCta.sub}
          </p>
          <a href="https://github.com/DanielDiasK/scrynx/releases/latest" className="btn btn-gold mt-9 h-14 rounded-2xl px-8 text-base">
            <Download size={19} strokeWidth={2.6} />
            {t.finalCta.cta}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line/70 bg-background">
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-xs">
              <a href="#top" className="flex items-center gap-2.5">
                <LogoMark size={30} />
                <Wordmark />
              </a>
              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                {t.footer.tagline}
              </p>
              <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {t.footer.madeWith}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                    {col.title}
                  </h4>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href={
                            link === "Download"
                              ? "https://github.com/DanielDiasK/scrynx/releases/latest"
                              : "#"
                          }
                          className="text-[13px] font-semibold text-foreground/80 transition-colors hover:text-foreground"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line/70 py-5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:flex-row">
            <span>© 2026 Scrynx. {t.footer.rights}</span>
            <span>{lang === "pt" ? "Feito no Brasil" : "Built for the desktop"}</span>
          </div>
        </div>

        {/* Giant wordmark */}
        <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden text-center">
          <div className="font-display text-[21vw] font-extrabold uppercase leading-[0.78] tracking-tighter text-outline">
            SCRYNX
          </div>
        </div>
      </footer>
    </>
  );
}
