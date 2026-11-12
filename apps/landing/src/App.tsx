import { useEffect } from "react";
import { LanguageProvider, useI18n } from "./i18n";
import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { Marquee } from "./sections/Marquee";
import { Features } from "./sections/Features";
import { HowItWorks } from "./sections/HowItWorks";
import { ManagerSection } from "./sections/ManagerSection";
import { Pricing } from "./sections/Pricing";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";

function Page() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <HowItWorks />
        <ManagerSection />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}
