import { useEffect, useState } from "react";
import { Download, Menu, X, CodeXml } from "lucide-react";
import { useI18n } from "../i18n";
import { LogoMark, Wordmark } from "../components/Logo";
import { LangToggle } from "../components/LangToggle";
import { ThemeToggle } from "../components/ThemeToggle";

export function Nav() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t.nav.features, href: "#features" },
    { label: t.nav.manager, href: "#manager" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.faq, href: "#faq" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "border-b border-line bg-background/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-card-2 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/DanielDiasK/scrynx"
            target="_blank"
            rel="noreferrer"
            aria-label="Scrynx on GitHub"
            title="Scrynx on GitHub"
            className="icon-btn hidden sm:inline-flex"
          >
            <CodeXml size={17} strokeWidth={2.2} />
          </a>
          <LangToggle />
          <ThemeToggle />
          <a
            href="https://github.com/DanielDiasK/scrynx/releases/latest"
            className="btn btn-gold hidden h-10 items-center gap-1.5 rounded-full px-5 text-[13px] md:inline-flex"
          >
            <Download size={15} strokeWidth={2.6} />
            {t.nav.cta}
          </a>
          <button
            className="icon-btn md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X size={19} strokeWidth={2.4} /> : <Menu size={19} strokeWidth={2.4} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-b border-line bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl space-y-2 px-4 py-4 sm:px-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl bg-card-2 px-4 py-3 text-sm font-bold text-foreground transition-colors hover:opacity-80"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://github.com/DanielDiasK/scrynx/releases/latest"
              onClick={() => setOpen(false)}
              className="btn btn-gold w-full justify-center px-4 py-3.5 text-sm"
            >
              <Download size={16} strokeWidth={2.6} />
              {t.nav.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
