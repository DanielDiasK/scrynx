import {
  LayoutDashboard,
  Images,
  Settings,
  Camera,
  Search,
  Bell,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { LogoMark } from "./Logo";
import { useI18n } from "../i18n";

/* ---------- Mini capture thumbnails (flat, same language as the app) ---------- */

function ThumbBrowser() {
  return (
    <div className="flex h-full w-full flex-col bg-[#17171f]">
      <div className="flex h-2.5 items-center gap-0.5 border-b border-white/8 bg-[#1e1e26] px-1">
        <div className="h-1 w-1 rounded-full bg-[#ff5f57]" />
        <div className="h-1 w-1 rounded-full bg-[#febc2e]" />
        <div className="h-1 w-1 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-1">
        <div className="h-1.5 w-2/3 rounded-[2px] bg-white/70" />
        <div className="h-0.5 w-full rounded-[2px] bg-white/25" />
        <div className="h-2 w-full rounded-[2px] bg-[#f6c96f]/80" />
      </div>
    </div>
  );
}

function ThumbCode() {
  const lines = [
    { w: "w-2/5", c: "bg-[#f6c96f]" },
    { w: "w-4/5", c: "bg-white/25" },
    { w: "w-3/4", c: "bg-[#a97cf6]" },
    { w: "w-1/2", c: "bg-white/15" },
    { w: "w-3/5", c: "bg-[#cdf463]" },
    { w: "w-2/3", c: "bg-white/15" },
  ];
  return (
    <div className="flex h-full w-full flex-col bg-[#101017] p-1">
      {lines.map((l, i) => (
        <div key={i} className="mb-[3px] flex items-center gap-0.5">
          <div className="h-0.5 w-1.5 rounded-[1px] bg-white/15" />
          <div className={`h-1 ${l.w} rounded-[2px] ${l.c}`} />
        </div>
      ))}
    </div>
  );
}

function ThumbDesign() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#17171f]">
      <div className="absolute left-1 top-1 h-1.5 w-8 rounded-[2px] bg-white/50" />
      <div className="absolute left-1 top-3.5 h-5 w-5 rounded-md bg-[#f6c96f]" />
      <div className="absolute left-7 top-3.5 h-2 w-8 rounded-[2px] bg-white/25" />
      <div className="absolute bottom-1 right-1 h-3.5 w-6 rounded-md bg-[#a97cf6]/70" />
    </div>
  );
}

const thumbs = [ThumbBrowser, ThumbCode, ThumbDesign];

/* ---------- The dashboard mock window ---------- */

export function AppMock({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const L = (pt: string, en: string) => (lang === "pt" ? pt : en);

  const stats = [
    { color: "bg-[#f6c96f]", title: L("Capturas hoje", "Shots today"), value: "12" },
    { color: "bg-[#a97cf6]", title: L("Esta semana", "This week"), value: "47" },
    { color: "bg-[#cdf463]", title: L("Favoritas", "Favorites"), value: "18" },
  ];

  const rail = [
    { name: "checkout-500.png", tag: "BUG", chip: "bg-[#f5b8b0] text-[#7c211a]" },
    { name: "hero_v3_final.png", tag: "DESIGN", chip: "bg-[#fbe0a1] text-[#6b4a08]" },
    { name: "tauri build.log", tag: "DEV", chip: "bg-[#d9ccf7] text-[#4b2d8f]" },
    { name: "deploy-thread.slack", tag: "RELEASE", chip: "bg-[#cde6b3] text-[#2c4a12]" },
  ];

  return (
    <div
      aria-hidden="true"
      className={`select-none overflow-hidden rounded-2xl bg-[#17171f] shadow-[var(--shadow)] ${className}`}
    >
      {/* Title bar */}
      <div className="flex h-7 items-center gap-1 border-b border-white/5 bg-[#1a1a22] px-2.5">
        <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <div className="h-2 w-2 rounded-full bg-[#28c840]" />
        <div className="mx-auto font-mono text-[8px] font-bold uppercase tracking-widest text-white/35">
          scrynx.exe
        </div>
        <div className="w-8" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-24 shrink-0 flex-col p-2 min-[420px]:flex">
          <div className="flex items-center gap-1.5 px-1 py-1">
            <LogoMark size={15} />
            <span className="text-[9px] font-extrabold tracking-tight text-white/90">scrynx</span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[7px] font-bold">
            <div className="flex items-center gap-1 rounded-md px-1 py-1 text-[#f6c96f]">
              <LayoutDashboard size={8} strokeWidth={2.5} /> Dashboard
            </div>
            <div className="flex items-center gap-1 rounded-md px-1 py-1 text-white/35">
              <Images size={8} strokeWidth={2.5} /> Biblioteca
            </div>
            <div className="flex items-center gap-1 rounded-md px-1 py-1 text-white/35">
              <Settings size={8} strokeWidth={2.5} /> Ajustes
            </div>
          </div>
          <button className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-[#f6c96f] py-1.5 text-[7px] font-black uppercase tracking-wide text-[#16130c]">
            <Camera size={8} strokeWidth={2.75} />
            {L("Captura", "Quick shot")}
          </button>
          <div className="mt-auto rounded-md border border-white/5 bg-white/[0.03] p-1">
            <div className="flex items-center justify-between font-mono text-[6px] text-white/35">
              <span>{L("Disco", "Disk")}</span>
              <span>31%</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[31%] bg-[#f6c96f]" />
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1 p-2 text-white">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-extrabold tracking-tight text-white/90">
                {L("Boa tarde, Admin", "Good afternoon, Admin")}
              </p>
              <p className="text-[6px] font-medium text-white/35">
                {L("Aqui está o resumo das suas capturas", "Here's the rundown of your captures")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/8">
                <Search size={7} strokeWidth={2.5} className="text-white/40" />
              </span>
              <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-white/8">
                <Bell size={7} strokeWidth={2.5} className="text-white/40" />
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-[#e85d5d]" />
              </span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f6c96f] text-[6px] font-black text-[#16130c]">
                AD
              </span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {stats.map((s, i) => (
              <div key={i} className={`${s.color} min-h-7 rounded-lg p-1 text-[#16130c]`}>
                <p className="text-[4.5px] font-extrabold leading-tight">{s.title}</p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-[11px] font-extrabold leading-none tracking-tight">{s.value}</p>
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#16130c] text-[#f6c96f]">
                    <ArrowUpRight size={6} strokeWidth={3} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-1.5 rounded-lg bg-[#1e1e26] p-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[6px] font-extrabold text-white/70">
                {L("Atividade de capturas", "Capture activity")}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 text-[5px] font-bold text-white/40">
                  <span className="h-1 w-1 rounded-full bg-[#a97cf6]" />
                  {L("Capturas", "Captures")}
                </span>
                <span className="flex items-center gap-0.5 text-[5px] font-bold text-white/40">
                  <span className="h-1 w-1 rounded-full bg-[#f6c96f]" />
                  {L("Meta", "Goal")}
                </span>
              </div>
            </div>
            <svg viewBox="0 0 260 64" className="mt-1 h-12 w-full" preserveAspectRatio="none">
              <line x1="0" y1="52" x2="260" y2="52" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="34" x2="260" y2="34" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="16" x2="260" y2="16" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <path
                d="M4 46 C 28 44, 34 48, 52 38 C 70 28, 72 12, 96 12 C 118 12, 122 40, 146 41 C 172 42, 178 26, 200 24 C 222 22, 226 30, 256 26"
                fill="none" stroke="#a97cf6" strokeWidth="2.4" strokeLinecap="round"
              />
              <path
                d="M4 52 C 28 51, 36 44, 54 40 C 74 35, 76 20, 98 19 C 120 18, 124 42, 148 44 C 174 46, 182 36, 202 34 C 222 32, 228 38, 256 33"
                fill="none" stroke="#f6c96f" strokeWidth="2" strokeLinecap="round" opacity="0.9"
              />
            </svg>
          </div>

          {/* Recent + rail */}
          <div className="mt-1.5 grid grid-cols-5 gap-1">
            <div className="col-span-2 rounded-lg bg-[#1e1e26] p-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[6px] font-extrabold text-white/70">
                  {L("Recentes", "Recent")}
                </span>
                <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white/10">
                  <Plus size={7} strokeWidth={3} className="text-white/50" />
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                {thumbs.map((T, i) => (
                  <div key={i} className="h-4 overflow-hidden rounded-[3px]">
                    <T />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-1">
                <span className="font-mono text-[4px] text-white/30">1.284 {L("indexadas", "indexed")}</span>
                <span className="text-[4px] font-black uppercase text-[#f6c96f]">
                  {L("Ver todas →", "View all →")}
                </span>
              </div>
            </div>
            <div className="col-span-3 space-y-1">
              {rail.map((c, i) => (
                <div key={i} className="rounded-lg bg-[#1e1e26] p-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-[5.5px] font-extrabold text-white/80">{c.name}</p>
                    <MoreHorizontal size={7} className="shrink-0 text-white/25" />
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <span className={`rounded px-1 text-[4px] font-black tracking-wider ${c.chip}`}>
                      {c.tag}
                    </span>
                    <span className="text-[4px] font-black uppercase text-white/45">
                      {i % 2 === 0 ? L("Copiar", "Copy") : L("Abrir", "Open")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
