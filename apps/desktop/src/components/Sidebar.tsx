import {
  LayoutDashboard,
  Images,
  Settings,
  Camera,
  Sparkles,
  PanelLeftClose,
} from "lucide-react";
import { useI18n } from "../i18n";
import { LogoMark, Wordmark } from "./Logo";
import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";

export type Page = "dashboard" | "library" | "settings";

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  captureCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onQuickCapture: () => void;
  onGoPro: () => void;
  capturing: boolean;
}

/** Flat purple promo artwork — camera aperture + sparkles on gradient */
function ProArt() {
  return (
    <svg viewBox="0 0 120 84" className="h-16 w-auto" aria-hidden="true" fill="none">
      <circle cx="60" cy="40" r="26" stroke="#efe9ff" strokeWidth="4" strokeOpacity="0.9" />
      <circle cx="60" cy="40" r="13" stroke="#efe9ff" strokeWidth="4" strokeOpacity="0.9" />
      <circle cx="60" cy="40" r="4" fill="#efe9ff" />
      <path d="M12 18l3.2 7.4L22.6 28l-7.4 2.9L12 38.4 8.7 31 1.4 28l7.3-2.6L12 18Z" fill="#efe9ff" fillOpacity="0.95" />
      <path d="M104 8l2.4 5.6 5.6 2.2-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.2L104 8Z" fill="#efe9ff" fillOpacity="0.75" />
      <path d="M100 52l2 4.6 4.6 1.9-4.6 2-2 4.6-2-4.6-4.6-2 4.6-1.9 2-4.6Z" fill="#efe9ff" fillOpacity="0.6" />
    </svg>
  );
}

export function Sidebar({
  page,
  onNavigate,
  captureCount,
  collapsed,
  onToggleCollapse,
  onQuickCapture,
  onGoPro,
  capturing,
}: SidebarProps) {
  const { t } = useI18n();

  const items: { id: Page; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { id: "dashboard", label: t.sidebar.dashboard, icon: LayoutDashboard },
    { id: "library", label: t.sidebar.library, icon: Images, badge: captureCount },
  ];

  const settingsItem = {
    id: "settings" as Page,
    label: t.sidebar.settings,
    icon: Settings,
  };

  const navButton = ({ id, label, icon: Icon, badge }: (typeof items)[number]) => {
    const active = page === id;
    return (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        aria-current={active ? "page" : undefined}
        title={collapsed ? label : undefined}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-colors ${
          collapsed ? "justify-center px-0" : ""
        } ${
          active ? "text-gold" : "text-muted-foreground hover:bg-card-2 hover:text-foreground"
        }`}
      >
        <Icon size={19} strokeWidth={2.1} className="shrink-0" />
        {!collapsed && <span className="flex-1 text-left">{label}</span>}
        {!collapsed && badge !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums ${
              active ? "bg-gold text-[#1a1710]" : "bg-card-2 text-muted-foreground"
            }`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-line transition-[width] duration-200 ease-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* ── Header bar ─────────────────────────────── */}
      <div className={`flex items-center gap-2 py-3 ${collapsed ? "justify-center px-2" : "justify-between px-3"}`}>
        {/* Logo becomes the expand/collapse button when minimized */}
        <button
          onClick={collapsed ? onToggleCollapse : () => onNavigate("dashboard")}
          className={`flex min-w-0 items-center gap-2.5 overflow-hidden rounded-xl transition-colors ${
            collapsed ? "p-1.5 hover:bg-card-2" : ""
          }`}
          aria-label={collapsed ? t.sidebar.expand : "Scrynx — Dashboard"}
          title={collapsed ? t.sidebar.expand : "Scrynx — Dashboard"}
        >
          <LogoMark size={30} />
          {!collapsed && <Wordmark className="text-lg" />}
        </button>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="icon-btn shrink-0"
            aria-label={t.sidebar.collapse}
            title={t.sidebar.collapse}
          >
            <PanelLeftClose size={17} strokeWidth={2.2} />
          </button>
        )}
      </div>
      <div className="border-t border-line" />

      {/* ── Scrollable nav area ─────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-1">
        {/* Quick capture */}
        <button
          onClick={onQuickCapture}
          disabled={capturing}
          title={collapsed ? t.sidebar.quickCapture : undefined}
          className={`btn btn-gold w-full items-center justify-center gap-2 rounded-2xl py-2.5 font-extrabold uppercase tracking-wide transition-opacity ${
            collapsed ? "px-0 text-[0px]" : "text-[12px]"
          } ${capturing ? "opacity-60" : ""}`}
        >
          <Camera size={17} strokeWidth={2.5} className={capturing ? "animate-pulse-dot" : ""} />
          {!collapsed && t.sidebar.quickCapture}
        </button>

        {/* Main nav */}
        <nav className="mt-1 space-y-1">{items.map(navButton)}</nav>
      </div>

      {/* ── Pinned footer ───────────────────────────── */}
      <div className="border-t border-line p-1">
        {/* Upgrade card sits above the settings menu */}
        {collapsed ? (
          <button
            onClick={onGoPro}
            title="Scrynx Pro"
            aria-label="Scrynx Pro"
            className="mb-1.5 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b63f2] to-[#5b3ac9] text-white transition-transform hover:scale-[1.03]"
          >
            <Sparkles size={18} strokeWidth={2.3} />
          </button>
        ) : (
          <div className="relative mb-1.5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#8b63f2] via-[#7a4fe8] to-[#5b3ac9] p-3 text-center">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            <div className="flex justify-center">
              <ProArt />
            </div>
            <p className="text-[11px] font-extrabold leading-snug text-white">
              {t.sidebar.goProTitle}
            </p>
            <button
              onClick={onGoPro}
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-black/90 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white transition-transform hover:scale-105"
            >
              <Sparkles size={11} strokeWidth={2.5} />
              {t.sidebar.goProCta}
            </button>
          </div>
        )}

        {/* Settings */}
        {navButton(settingsItem)}

        {/* Toggles + version */}
        <div className={`mt-1.5 flex items-center gap-2 border-t border-line pt-2 ${collapsed ? "justify-center" : "justify-between px-1"}`}>
          {!collapsed && <LangToggle />}
          <ThemeToggle />
        </div>
        {!collapsed && (
          <p className="mt-1.5 text-center font-mono text-[8px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/70">
            {t.sidebar.version}
          </p>
        )}
      </div>
    </aside>
  );
}
