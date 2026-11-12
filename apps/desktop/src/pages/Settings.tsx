import { useEffect, useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Keyboard,
  Settings2,
  Camera,
  CircleUserRound,
  Info,
  FolderOpen,
  FolderCog,
  ShieldCheck,
  UserRoundPlus,
  Check,
  RefreshCw,
} from "lucide-react";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useI18n } from "../i18n";
import type { Lang } from "../locales";
import type { LocalProfile } from "../lib/bridge";
import { getAppVersion, checkForUpdateStrict } from "../lib/bridge";

const inTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

interface SettingsState {
  launchStartup: boolean;
  minimizeToTray: boolean;
  trayBadge: boolean;
  format: "png" | "jpeg" | "webp";
  includeCursor: boolean;
  quickPreview: boolean;
  quality: number;
  shortcuts: string[];
}

const defaultSettings: SettingsState = {
  launchStartup: true,
  minimizeToTray: true,
  trayBadge: false,
  format: "png",
  includeCursor: false,
  quickPreview: true,
  quality: 85,
  shortcuts: ["Ctrl + Shift + S", "Ctrl + Shift + A", "Ctrl + Shift + D", "Ctrl + Shift + L"],
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem("scrynx-settings");
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultSettings;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-gold" : "bg-card-2"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-foreground shadow transition-all duration-200 ${
          checked ? "left-[23px] bg-[#1a1710]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function Row({
  label,
  desc,
  control,
}: {
  label: string;
  desc?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-extrabold tracking-tight">{label}</p>
        {desc && <p className="mt-0.5 text-[11px] font-medium leading-snug text-muted-foreground">{desc}</p>}
      </div>
      {control}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Settings2;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="flex items-center gap-3 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-[#1a1710]">
          <Icon size={17} strokeWidth={2.3} />
        </span>
        <div>
          <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.22em]">{title}</h2>
          {desc && <p className="text-[10.5px] font-medium text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <div className="divide-y divide-line border-t border-line">{children}</div>
    </section>
  );
}

interface SettingsProps {
  onNotify: (msg: string) => void;
  captureDir: string;
  onPickFolder: () => void;
  onOpenCaptureDir: () => void;
  profile: LocalProfile | null;
  onSaveProfile: (profile: LocalProfile | null) => Promise<void>;
  onPrimaryShortcutChange: (combo: string) => void;
}

export function Settings({
  onNotify,
  captureDir,
  onPickFolder,
  onOpenCaptureDir,
  profile,
  onSaveProfile,
  onPrimaryShortcutChange,
}: SettingsProps) {
  const { t, lang, setLang } = useI18n();
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [listening, setListening] = useState<number | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [profileName, setProfileName] = useState(profile?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(profile?.email ?? "");
  const [profileError, setProfileError] = useState(false);
  const [appVersion, setAppVersion] = useState("0.1.0");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    getAppVersion().then(setAppVersion);
  }, []);

  const manualCheck = async () => {
    if (!inTauri) {
      onNotify(t.settings.updateFailed);
      return;
    }
    setChecking(true);
    try {
      const update = await checkForUpdateStrict();
      onNotify(update ? t.settings.updateAvailable.replace("{v}", update.version) : t.settings.upToDate);
    } catch {
      onNotify(t.settings.updateFailed);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("scrynx-settings", JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  // Sync the "launch with Windows" toggle with the real OS autostart entry
  useEffect(() => {
    if (!inTauri) return;
    isEnabled()
      .then((v) => setSettings((prev) => ({ ...prev, launchStartup: v })))
      .catch(() => {});
  }, []);

  const toggleLaunchStartup = async (v: boolean) => {
    if (inTauri) {
      try {
        if (v) await enable();
        else await disable();
      } catch {
        /* keep local preference in sync even if the OS call fails */
      }
    }
    update("launchStartup", v);
    onNotify(t.toasts.settingsSaved);
  };

  useEffect(() => {
    if (listening === null) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setListening(null);
        return;
      }
      if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) return;
      const mods = [
        e.ctrlKey && "Ctrl",
        e.shiftKey && "Shift",
        e.altKey && "Alt",
        e.metaKey && "Meta",
      ].filter(Boolean) as string[];
      const main = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      const combo = [...mods, main].join(" + ");
      setSettings((prev) => {
        const shortcuts = [...prev.shortcuts];
        shortcuts[listening] = combo;
        return { ...prev, shortcuts };
      });
      if (listening === 0) onPrimaryShortcutChange(combo); // rebind the real OS-wide shortcut
      setListening(null);
      onNotify(t.toasts.shortcutUpdated);
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const update = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const shortcutRows = [
    t.settings.shortcutCapture,
    t.settings.shortcutRegion,
    t.settings.shortcutWindow,
    t.settings.shortcutLibrary,
  ];

  const displayDir = captureDir.length > 34 ? `…${captureDir.slice(-33)}` : captureDir;

  const initials = (profile?.name ?? "AD")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const saveLocalProfile = async () => {
    const name = profileName.trim();
    const email = profileEmail.trim();
    if (!name) {
      setProfileError(true);
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setProfileError(true);
      return;
    }
    setProfileError(false);
    await onSaveProfile({ name, email });
    setProfileFormOpen(false);
  };

  const selectClass =
    "appearance-none rounded-xl bg-card-2 py-2.5 pl-4 pr-9 text-[11px] font-bold uppercase outline-none transition-shadow focus:shadow-[0_0_0_2px_hsl(var(--gold))]";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-4 p-6 xl:p-7">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">{t.settings.title}</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{t.settings.subtitle}</p>
        </header>

        {/* General */}
        <Section icon={Settings2} title={t.settings.general}>
          <Row
            label={t.settings.folderRow}
            desc={t.settings.folderDesc}
            control={
              <div className="flex items-center gap-2">
                <span
                  className="hidden max-w-44 truncate font-mono text-[10px] font-bold text-muted-foreground sm:block"
                  title={captureDir}
                >
                  {displayDir}
                </span>
                <button
                  onClick={onPickFolder}
                  className="btn btn-tonal rounded-xl px-3 py-2 text-[10px] uppercase tracking-wide"
                >
                  <FolderCog size={13} strokeWidth={2.5} />
                  {t.settings.change}
                </button>
                <button
                  onClick={onOpenCaptureDir}
                  className="icon-btn"
                  aria-label={t.settings.folderOpen}
                  title={t.settings.folderOpen}
                >
                  <FolderOpen size={16} strokeWidth={2.2} />
                </button>
              </div>
            }
          />
          <Row
            label={t.settings.launchStartup}
            desc={t.settings.launchStartupDesc}
            control={
              <Toggle
                checked={settings.launchStartup}
                onChange={toggleLaunchStartup}
                label={t.settings.launchStartup}
              />
            }
          />
          <Row
            label={t.settings.minimizeToTray}
            desc={t.settings.minimizeToTrayDesc}
            control={
              <Toggle
                checked={settings.minimizeToTray}
                onChange={(v) => update("minimizeToTray", v)}
                label={t.settings.minimizeToTray}
              />
            }
          />
          <Row
            label={t.settings.trayBadge}
            desc={t.settings.trayBadgeDesc}
            control={
              <Toggle
                checked={settings.trayBadge}
                onChange={(v) => update("trayBadge", v)}
                label={t.settings.trayBadge}
              />
            }
          />
          <Row
            label={t.settings.language}
            desc={t.settings.languageDesc}
            control={
              <div className="relative">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  aria-label={t.settings.language}
                  className={selectClass}
                >
                  <option value="pt">Português (BR)</option>
                  <option value="en">English</option>
                </select>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            }
          />
        </Section>

        {/* Capture */}
        <Section icon={Camera} title={t.settings.capture}>
          <Row
            label={t.settings.format}
            desc={t.settings.formatDesc}
            control={
              <div className="relative">
                <select
                  value={settings.format}
                  onChange={(e) => update("format", e.target.value as SettingsState["format"])}
                  className={selectClass}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
                <ChevronDown
                  size={13}
                  strokeWidth={2.5}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            }
          />
          <Row
            label={t.settings.includeCursor}
            control={
              <Toggle
                checked={settings.includeCursor}
                onChange={(v) => update("includeCursor", v)}
                label={t.settings.includeCursor}
              />
            }
          />
          <Row
            label={t.settings.quickPreview}
            desc={t.settings.quickPreviewDesc}
            control={
              <Toggle
                checked={settings.quickPreview}
                onChange={(v) => update("quickPreview", v)}
                label={t.settings.quickPreview}
              />
            }
          />
          <Row
            label={t.settings.quality}
            control={
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={settings.quality}
                  onChange={(e) => update("quality", Number(e.target.value))}
                  aria-label={t.settings.quality}
                  className="h-2.5 w-32 cursor-pointer appearance-none rounded-full bg-card-2"
                  style={{ accentColor: "hsl(41 88% 69%)" }}
                />
                <span className="w-10 text-right font-mono text-xs font-black tabular-nums">
                  {settings.quality}%
                </span>
              </div>
            }
          />
        </Section>

        {/* Shortcuts */}
        <Section icon={Keyboard} title={t.settings.shortcuts} desc={t.settings.shortcutsDesc}>
          {shortcutRows.map((label, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <p className="text-sm font-bold">{label}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  {settings.shortcuts[i].split(" + ").map((key, j) => (
                    <span key={j} className="flex items-center gap-1">
                      {j > 0 && <span className="font-mono text-xs font-black text-muted-foreground">+</span>}
                      <kbd className="kbd">{key}</kbd>
                    </span>
                  ))}
                </span>
                <button
                  onClick={() => setListening(listening === i ? null : i)}
                  className={`min-w-20 rounded-xl px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider transition-all ${
                    listening === i
                      ? "animate-pulse-dot bg-gold text-[#1a1710]"
                      : "bg-card-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {listening === i ? t.settings.listening : t.settings.change}
                </button>
              </div>
            </div>
          ))}
        </Section>

        {/* Account */}
        <Section icon={CircleUserRound} title={t.settings.account}>
          {profile ? (
            <div className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-lg font-extrabold text-[#1a1710]">
                  {initials}
                </span>
                <div>
                  <p className="text-base font-extrabold tracking-tight">{profile.name}</p>
                  <p className="font-mono text-[10px] font-semibold text-muted-foreground">
                    {profile.email || t.settings.accountNone}
                  </p>
                  <p className="mt-1.5 inline-block rounded-full bg-card-2 px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider">
                    {t.settings.plan}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => onNotify(t.toasts.proSoon)}
                  className="btn btn-gold px-4 py-2.5 text-[10px] uppercase tracking-wide"
                >
                  <Sparkles size={14} strokeWidth={2.5} />
                  {t.settings.goPro}
                </button>
                <button
                  onClick={() => onSaveProfile(null)}
                  className="mt-2 block text-[9px] font-black uppercase tracking-wider text-coral transition-colors hover:text-coral/80"
                >
                  {t.settings.removeProfile}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card-2 text-gold">
                  <ShieldCheck size={22} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold tracking-tight">{t.settings.accountNone}</p>
                  <p className="mt-0.5 text-[11px] font-medium leading-snug text-muted-foreground">
                    {t.onboarding.optionProfileDesc}
                  </p>
                </div>
              </div>

              {!profileFormOpen ? (
                <button
                  onClick={() => setProfileFormOpen(true)}
                  className="btn btn-tonal mt-4 rounded-2xl px-5 py-2.5 text-[10px] uppercase tracking-wide"
                >
                  <UserRoundPlus size={14} strokeWidth={2.4} />
                  {t.settings.createLocalProfile}
                </button>
              ) : (
                <div className="mt-4 grid max-w-md gap-2">
                  <input
                    value={profileName}
                    onChange={(e) => {
                      setProfileName(e.target.value);
                      setProfileError(false);
                    }}
                    placeholder={t.onboarding.namePlaceholder}
                    aria-label={t.onboarding.nameLabel}
                    className={`h-11 rounded-xl bg-card-2 px-4 text-sm font-semibold outline-none placeholder:text-muted-foreground/60 focus:shadow-[0_0_0_2px_hsl(var(--gold))] ${
                      profileError ? "shadow-[0_0_0_2px_hsl(var(--coral))]" : ""
                    }`}
                  />
                  <input
                    value={profileEmail}
                    onChange={(e) => {
                      setProfileEmail(e.target.value);
                      setProfileError(false);
                    }}
                    placeholder={t.onboarding.emailPlaceholder}
                    type="email"
                    aria-label={t.settings.emailOptional}
                    className="h-11 rounded-xl bg-card-2 px-4 text-sm font-semibold outline-none placeholder:text-muted-foreground/60 focus:shadow-[0_0_0_2px_hsl(var(--gold))]"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveLocalProfile}
                      className="btn btn-gold rounded-xl px-5 py-2.5 text-[10px] uppercase tracking-wide"
                    >
                      <Check size={13} strokeWidth={3} />
                      {t.settings.saveProfile}
                    </button>
                    <button
                      onClick={() => setProfileFormOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t.onboarding.back}
                    </button>
                  </div>
                  {profileError && (
                    <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-coral">
                      {t.settings.nameRequiredShort}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Updates */}
        <Section icon={RefreshCw} title={t.settings.updatesSection} desc={t.settings.updatesDesc}>
          <Row
            label={t.settings.currentVersion}
            control={
              <span className="rounded-full bg-card-2 px-3 py-1.5 font-mono text-[11px] font-black tabular-nums">
                v{appVersion}
              </span>
            }
          />
          <Row
            label={t.settings.checkUpdates}
            control={
              <button
                onClick={manualCheck}
                disabled={checking}
                className="btn btn-tonal rounded-xl px-4 py-2 text-[10px] uppercase tracking-wide disabled:opacity-60"
              >
                <RefreshCw size={13} strokeWidth={2.5} className={checking ? "animate-spin" : ""} />
                {checking ? t.settings.checkingUpdates : t.settings.checkUpdates}
              </button>
            }
          />
        </Section>

        <p className="flex items-center justify-center gap-1.5 pb-4 font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
          <Info size={11} strokeWidth={2.5} />
          Scrynx v0.1.0 · local-first · {lang === "pt" ? "seus dados ficam no seu PC" : "your data stays on your PC"}
        </p>
      </div>
    </div>
  );
}
