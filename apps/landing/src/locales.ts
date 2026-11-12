export type Lang = "en" | "pt";

export const en = {
  nav: {
    features: "Features",
    manager: "Capture Manager",
    pricing: "Pricing",
    faq: "FAQ",
    cta: "Download free",
  },
  hero: {
    badge: "v1.0 · Available for Windows",
    titleA: "Capture.",
    titleB: "Annotate.",
    titleC: "Organize.",
    sub: "Scrynx is the screenshot app that goes beyond the print key — any capture mode, pro annotations, OCR and a capture manager that keeps every print in its place.",
    ctaPrimary: "Download for Windows",
    ctaPrimaryNote: "free, 8 MB",
    ctaSecondary: "See the manager in action",
    micro: "Free forever · macOS & Linux soon · No account needed",
    toast: "Copied to clipboard",
    toastSub: "screenshot_2026-11-12_1524.png",
    marquee: "Region select · OCR · Hotkeys · Blur · Scrolling capture · Tags · Favorites · Insights ·",
  },
  stats: [
    { value: "12k+", label: "captures organized every week" },
    { value: "4.9/5", label: "average rating from early testers" },
    { value: "8 MB", label: "installer — lighter than a wallpaper" },
    { value: "100%", label: "local-first. Your prints never leave your PC" },
  ],
  features: {
    eyebrow: "Features",
    title: "Everything the print key can't do",
    sub: "From the moment you press the shortcut to filed, searchable and reusable — Scrynx covers the whole flow.",
    items: [
      {
        title: "Any capture you need",
        desc: "Full screen, window, region or scrolling page — with timer, self-timer and freeze-on-shot.",
      },
      {
        title: "Annotations that stick",
        desc: "Arrows, text, blur, highlights, shapes and numbered steps — mark up like a pro.",
      },
      {
        title: "OCR built in",
        desc: "Copy text out of any capture and find it later — searching works on OCR text too.",
      },
      {
        title: "A real capture manager",
        desc: "Every screenshot in one searchable dashboard: tags, favorites, stats and storage.",
      },
      {
        title: "Global hotkeys",
        desc: "Ctrl+Shift+S from anywhere in the OS. Rebind every shortcut to your muscle memory.",
      },
      {
        title: "Privacy first",
        desc: "Local-first storage, one-click blur for sensitive data. No forced cloud, no lock-in.",
      },
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "From shortcut to archived in seconds",
    steps: [
      {
        title: "Press Ctrl+Shift+S",
        desc: "The screen freezes and the selector appears — no more Alt+Tab juggling.",
      },
      {
        title: "Frame, annotate, done",
        desc: "Drag the region, drop arrows, blur or text, then copy or save straight away.",
      },
      {
        title: "Find it in seconds",
        desc: "Search by title, app, tag — or by the text inside the image via OCR.",
      },
    ],
  },
  manager: {
    eyebrow: "Capture Manager",
    title: "Not a snipper — a home for your screenshots.",
    sub: "The dashboard turns capture chaos into a library you'll actually revisit.",
    bullets: [
      "Search everything — titles, apps, tags and OCR text",
      "Insights that matter — captures per week, top apps, storage usage",
      "Favorites, tags and smart filters for fast retrieval",
      "One click to copy, re-annotate, pin or delete",
    ],
    cta: "Download Scrynx free",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Simple, honest pricing",
    sub: "Start free. Upgrade when the pile of prints gets serious.",
    monthly: "Monthly",
    annual: "Annual",
    annualHint: "2 months free",
    forever: "forever",
    perMonth: "per month",
    perUserMonth: "per user / month",
    mostPopular: "Most popular",
    plans: [
      {
        name: "Free",
        desc: "For personal, everyday capturing",
        priceMonthly: 0,
        priceAnnual: 0,
        cta: "Download free",
        features: [
          "Unlimited captures",
          "Basic annotations (arrow, text, highlight)",
          "Library up to 500 captures",
          "Local storage only",
          "Ctrl+Shift+S global hotkey",
        ],
      },
      {
        name: "Pro",
        desc: "For people who live in screenshots",
        priceMonthly: 8,
        priceAnnual: 6,
        cta: "Get Pro",
        features: [
          "Everything in Free, unlimited",
          "Full annotation suite + smart blur",
          "OCR search across your library",
          "Scrolling capture & custom presets",
          "Custom hotkeys for everything",
          "Priority support",
        ],
      },
      {
        name: "Team",
        desc: "Shared capture hubs for product & support",
        priceMonthly: 14,
        priceAnnual: 11,
        cta: "Talk to us",
        features: [
          "Everything in Pro",
          "Shared team workspaces & libraries",
          "SSO / SAML & admin controls",
          "Centralized billing & seats",
          "SLA + dedicated onboarding",
        ],
      },
    ],
    footnote: "Prices in USD, billed in your region. Local taxes may apply.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    items: [
      {
        q: "Is Scrynx really free?",
        a: "Yes. The Free plan gives you unlimited captures and basic annotations forever — no credit card, no trial clock. Pro unlocks the full toolkit when you're ready.",
      },
      {
        q: "Where are my captures stored?",
        a: "Locally, on your machine — Scrynx is local-first, which means your prints never leave your PC. Optional cloud sync is on the roadmap for Pro.",
      },
      {
        q: "Does it work offline?",
        a: "100%. No account is required to use Scrynx, and there's no telemetry you didn't explicitly opt into.",
      },
      {
        q: "Which platforms are supported?",
        a: "Windows 10/11 today. macOS and Linux builds are the next milestones — the codebase is already cross-platform (Tauri).",
      },
      {
        q: "Can I migrate from ShareX or Lightshot?",
        a: "Yes — go to Settings → Import and point Scrynx at your existing capture folders. Everything is indexed, tagged and made searchable automatically.",
      },
    ],
  },
  finalCta: {
    title: "Your desktop, one shortcut away from organized.",
    sub: "Join thousands of people who never lost a screenshot again.",
    cta: "Download Scrynx — it's free",
    micro: "Windows 10/11 · 8 MB · No account",
  },
  footer: {
    tagline: "Capture. Annotate. Organize.",
    product: "Product",
    resources: "Resources",
    legal: "Legal",
    productLinks: ["Download", "Changelog", "Roadmap"],
    resourceLinks: ["Documentation", "Keyboard shortcuts", "Import your data"],
    legalLinks: ["Privacy", "Terms", "Open-source licenses"],
    madeWith: "Made with Rust + React",
    rights: "All rights reserved.",
  },
};

export type Dict = typeof en;

export const pt: Dict = {
  nav: {
    features: "Recursos",
    manager: "Gestor de Capturas",
    pricing: "Preços",
    faq: "FAQ",
    cta: "Baixar grátis",
  },
  hero: {
    badge: "v1.0 · Disponível para Windows",
    titleA: "Capture.",
    titleB: "Anote.",
    titleC: "Organize.",
    sub: "O Scrynx é o app de screenshot além da tecla Print Screen — qualquer modo de captura, anotações profissionais, OCR e um gestor de capturas que mantém cada print no seu lugar.",
    ctaPrimary: "Baixar para Windows",
    ctaPrimaryNote: "grátis, 8 MB",
    ctaSecondary: "Ver o gestor por dentro",
    micro: "Grátis para sempre · macOS e Linux em breve · Sem conta",
    toast: "Copiado para a área de transferência",
    toastSub: "captura_2026-11-12_1524.png",
    marquee: "Selecionar região · OCR · Atalhos · Desfoque · Página rolável · Tags · Favoritos · Estatísticas ·",
  },
  stats: [
    { value: "12 mil+", label: "capturas organizadas toda semana" },
    { value: "4.9/5", label: "avaliação média dos beta testers" },
    { value: "8 MB", label: "instalador — mais leve que um wallpaper" },
    { value: "100%", label: "local-first. Seus prints não saem do seu PC" },
  ],
  features: {
    eyebrow: "Recursos",
    title: "Tudo o que o Print Screen não faz",
    sub: "Do momento em que você aperta o atalho até arquivar e pesquisar — o Scrynx cobre o fluxo inteiro.",
    items: [
      {
        title: "A captura que você precisa",
        desc: "Tela cheia, janela, região ou página rolável — com timer, auto-disparo e tela congelada.",
      },
      {
        title: "Anotações de verdade",
        desc: "Setas, texto, desfoque, destaque, formas e passos numerados. Anotação nível profissional.",
      },
      {
        title: "OCR integrado",
        desc: "Copie texto de qualquer captura e encontre depois — a busca também varre o texto do OCR.",
      },
      {
        title: "Um gestor de verdade",
        desc: "Todos os prints num dashboard pesquisável: tags, favoritos, estatísticas e armazenamento.",
      },
      {
        title: "Atalhos globais",
        desc: "Ctrl+Shift+S de qualquer canto do sistema. Reconfigure cada atalho do seu jeito.",
      },
      {
        title: "Privacidade em primeiro lugar",
        desc: "Armazenamento local, desfoque com um clique para dados sensíveis. Sem nuvem forçada.",
      },
    ],
  },
  how: {
    eyebrow: "Como funciona",
    title: "Do atalho ao arquivo em segundos",
    steps: [
      {
        title: "Pressione Ctrl+Shift+S",
        desc: "A tela congela e o seletor aparece — sem malabarismo de Alt+Tab.",
      },
      {
        title: "Selecione, anote, pronto",
        desc: "Arraste a região, jogue setas, desfoque ou texto e copie direto.",
      },
      {
        title: "Ache em segundos",
        desc: "Busque por título, app, tag — ou pelo texto dentro da imagem via OCR.",
      },
    ],
  },
  manager: {
    eyebrow: "Gestor de Capturas",
    title: "Não é um recortador — é a casa dos seus prints.",
    sub: "O dashboard transforma o caos de capturas numa biblioteca que você realmente visita de novo.",
    bullets: [
      "Busque tudo — títulos, apps, tags e texto de OCR",
      "Estatísticas de verdade — capturas por semana, apps favoritos e armazenamento",
      "Favoritos, tags e filtros inteligentes para achar na hora",
      "Um clique para copiar, reanotar, fixar ou excluir",
    ],
    cta: "Baixar o Scrynx grátis",
  },
  pricing: {
    eyebrow: "Preços",
    title: "Preços simples e honestos",
    sub: "Comece grátis. Faça upgrade quando a pilha de prints ficar séria.",
    monthly: "Mensal",
    annual: "Anual",
    annualHint: "2 meses grátis",
    forever: "para sempre",
    perMonth: "por mês",
    perUserMonth: "por usuário / mês",
    mostPopular: "Mais popular",
    plans: [
      {
        name: "Grátis",
        desc: "Para capturas pessoais do dia a dia",
        priceMonthly: 0,
        priceAnnual: 0,
        cta: "Baixar grátis",
        features: [
          "Capturas ilimitadas",
          "Anotações básicas (seta, texto, destaque)",
          "Biblioteca de até 500 capturas",
          "Somente armazenamento local",
          "Atalho global Ctrl+Shift+S",
        ],
      },
      {
        name: "Pro",
        desc: "Para quem vive de screenshot",
        priceMonthly: 8,
        priceAnnual: 6,
        cta: "Quero o Pro",
        features: [
          "Tudo do Grátis, sem limites",
          "Arsenal completo de anotações + desfoque inteligente",
          "Busca por OCR em toda a biblioteca",
          "Página rolável e presets personalizados",
          "Atalhos personalizados para tudo",
          "Suporte prioritário",
        ],
      },
      {
        name: "Time",
        desc: "Biblioteca de capturas compartilhada para produto e suporte",
        priceMonthly: 14,
        priceAnnual: 11,
        cta: "Fale com a gente",
        features: [
          "Tudo do Pro",
          "Workspaces e bibliotecas compartilhadas",
          "SSO / SAML e controles de admin",
          "Cobrança centralizada e cadeiras",
          "SLA + onboarding dedicado",
        ],
      },
    ],
    footnote: "Preços em dólar, cobrados na sua região. Impostos locais podem ser aplicados.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Perguntas, respondidas",
    items: [
      {
        q: "O Scrynx é realmente grátis?",
        a: "Sim. O plano Grátis dá capturas ilimitadas e anotações básicas para sempre — sem cartão e sem cronômetro. O Pro libera o arsenal completo quando você quiser.",
      },
      {
        q: "Onde minhas capturas ficam salvas?",
        a: "Localmente, na sua máquina — o Scrynx é local-first, ou seja, seus prints não saem do seu PC. Sincronização em nuvem opcional está no roadmap do Pro.",
      },
      {
        q: "Funciona offline?",
        a: "100%. Não é preciso conta para usar o Scrynx, e não existe telemetria sem o seu consentimento explícito.",
      },
      {
        q: "Quais plataformas são suportadas?",
        a: "Windows 10/11 hoje. macOS e Linux são os próximos marcos — o código já é multiplataforma (Tauri).",
      },
      {
        q: "Posso migrar do ShareX ou Lightshot?",
        a: "Sim — vá em Ajustes → Importar e aponte o Scrynx para suas pastas de capturas atuais. Tudo é indexado, tagueado e pesquisável automaticamente.",
      },
    ],
  },
  finalCta: {
    title: "Seu desktop a um atalho de distância da organização.",
    sub: "Junte-se a milhares de pessoas que nunca mais perderam um screenshot.",
    cta: "Baixar o Scrynx — é grátis",
    micro: "Windows 10/11 · 8 MB · Sem conta",
  },
  footer: {
    tagline: "Capture. Anote. Organize.",
    product: "Produto",
    resources: "Recursos",
    legal: "Legal",
    productLinks: ["Download", "Changelog", "Roadmap"],
    resourceLinks: ["Documentação", "Atalhos de teclado", "Importar seus dados"],
    legalLinks: ["Privacidade", "Termos", "Licenças open source"],
    madeWith: "Feito com Rust + React",
    rights: "Todos os direitos reservados.",
  },
};

export const locales: Record<Lang, Dict> = { en, pt };
