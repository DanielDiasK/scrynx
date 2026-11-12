import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Bell,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Copy,
  Trash2,
  FolderOpen,
  MoreHorizontal,
  CheckCheck,
  Image as ImageIcon,
  Folder,
} from "lucide-react";
import { useI18n } from "../i18n";
import {
  type CaptureMeta,
  type FolderStats,
  getActivity,
  fileSrc,
  type ActivityItem,
} from "../lib/bridge";
import { formatBytesShort, formatBytes, timeAgoFromSecs } from "../lib/format";

interface DashboardProps {
  captures: CaptureMeta[];
  stats: FolderStats;
  captureDir: string;
  unread: number;
  onQuickCapture: () => void;
  onDelete: (cap: CaptureMeta) => void;
  onViewAll: () => void;
  onOpenCapture: (cap: CaptureMeta) => void;
  onOpenCaptureFile: (cap: CaptureMeta) => void;
  onCopyImage: (cap: CaptureMeta) => void;
  onGoSettings: () => void;
  onActivityRead: () => void;
}

const extChip: Record<string, string> = {
  PNG: "tag-design",
  JPG: "tag-dev",
  JPEG: "tag-dev",
  WEBP: "tag-ui",
  BMP: "tag-ref",
};

const toneDot: Record<ActivityItem["tone"], string> = {
  gold: "bg-gold",
  purple: "bg-purple",
  lime: "bg-lime",
  coral: "bg-coral",
};

function fileExt(name: string): string {
  const ext = name.split(".").pop()?.toUpperCase() ?? "IMG";
  return ext.length <= 5 ? ext : "IMG";
}

function folderBase(dir: string): string {
  return dir.split(/[\\/]/).filter(Boolean).pop() ?? dir;
}

/* ---------- Activity chart from REAL modified dates ---------- */

function useWeeklySeries(captures: CaptureMeta[], lang: "en" | "pt" | string, todayLabel: string) {
  return useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const counts = days.map((day) => {
      const start = day.getTime() / 1000;
      const end = start + 86400;
      return captures.filter((c) => c.modifiedSecs >= start && c.modifiedSecs < end).length;
    });
    const weekday = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
      weekday: "short",
    });
    const labels = days.map((d, i) => (i === 6 ? todayLabel : weekday.format(d)));
    const total = counts.reduce((a, b) => a + b, 0);
    const max = Math.max(...counts, 1);
    return { counts, labels, total, max };
  }, [captures, lang, todayLabel]);
}

export function Dashboard({
  captures,
  stats,
  captureDir,
  unread,
  onQuickCapture,
  onDelete,
  onViewAll,
  onOpenCapture,
  onOpenCaptureFile,
  onCopyImage,
  onGoSettings,
  onActivityRead,
}: DashboardProps) {
  const { t, lang } = useI18n();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<ActivityItem[]>([]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.dashboard.greetingMorning
      : hour < 18
        ? t.dashboard.greetingAfternoon
        : t.dashboard.greetingEvening;

  const now = Date.now() / 1000;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const todayStartSecs = Math.floor(dayStart.getTime() / 1000);

  const today = useMemo(
    () => captures.filter((c) => c.modifiedSecs >= todayStartSecs).length,
    [captures, todayStartSecs],
  );
  const week = useMemo(
    () => captures.filter((c) => c.modifiedSecs >= now - 7 * 86400).length,
    [captures, now],
  );
  const favorites = useMemo(() => captures.filter((c) => c.favorite).length, [captures]);
  const recent = captures.slice(0, 4);
  const listRows = captures.slice(0, 3);
  const { counts, labels, total: weekTotal, max: weekMax } = useWeeklySeries(
    captures,
    lang,
    t.dashboard.chartDays[6],
  );

  const captureFormat = (() => {
    try {
      const raw = localStorage.getItem("scrynx-settings");
      if (raw) return (JSON.parse(raw) as { format?: string }).format?.toUpperCase() ?? "PNG";
    } catch {
      /* default */
    }
    return "PNG";
  })();

  const statsCards = [
    { color: "bg-gold", title: t.dashboard.stats.today, count: today, label: t.dashboard.statTotal, value: String(today) },
    { color: "bg-purple", title: t.dashboard.stats.week, count: week, label: t.dashboard.statWeek, value: String(week) },
    { color: "bg-lime", title: t.dashboard.stats.favorites, count: favorites, label: t.dashboard.statSaved, value: String(favorites) },
  ];

  // Load activity when the popover opens
  useEffect(() => {
    if (!notifOpen) return;
    getActivity()
      .then(setNotifItems)
      .catch(() => setNotifItems([]));
  }, [notifOpen]);

  const activityText = (item: ActivityItem) =>
    t.activity[item.action].replace("{name}", item.name ?? "");

  const railActions: { label: string; cls: string; act: (cap: CaptureMeta) => void }[] = [
    { label: t.dashboard.copyShort, cls: "btn-gold", act: onCopyImage },
    { label: t.dashboard.openShort, cls: "btn-lime", act: onOpenCaptureFile },
    { label: t.dashboard.copyShort, cls: "btn-gold", act: onCopyImage },
    { label: t.dashboard.openShort, cls: "btn-lime", act: onOpenCaptureFile },
  ];

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1400px] p-5 xl:p-6">
        {/* ===== Header ===== */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {greeting}, {t.dashboard.name}
            </h1>
            <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
              {t.dashboard.subtitle}
            </p>
          </div>

          <div className="relative flex items-center gap-2.5">
            <button className="circle-btn" onClick={onViewAll} aria-label={t.library.searchPlaceholder}>
              <Search size={18} strokeWidth={2.2} />
            </button>

            <button
              className="circle-btn relative"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={t.dashboard.notifTitle}
              aria-expanded={notifOpen}
            >
              <Bell size={18} strokeWidth={2.2} />
              {unread > 0 && (
                <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-coral" />
                </span>
              )}
            </button>

            <button
              onClick={onGoSettings}
              aria-label={t.settings.account}
              title={t.settings.account}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-[13px] font-extrabold text-[#1a1710] transition-transform hover:scale-105"
            >
              AD
            </button>

            {/* Notifications popover — real activity */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setNotifOpen(false)} />
                <div className="animate-pop-in absolute right-0 top-14 z-30 w-80 rounded-2xl bg-card p-3 shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between px-1.5 pb-2">
                    <h2 className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                      {t.dashboard.notifTitle}
                    </h2>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        onActivityRead();
                      }}
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gold transition-colors hover:bg-card-2"
                    >
                      <CheckCheck size={11} strokeWidth={2.5} />
                      {t.dashboard.notifMarkRead}
                    </button>
                  </div>
                  {notifItems.length === 0 ? (
                    <p className="px-1.5 py-6 text-center font-mono text-[10px] font-medium text-muted-foreground">
                      {t.dashboard.notifEmpty}
                    </p>
                  ) : (
                    <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                      {notifItems.map((item) => (
                        <li key={item.id} className="flex items-start gap-2.5 px-1.5 py-2.5">
                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[item.tone]}`} />
                          <span className="min-w-0">
                            <span className="block break-words text-[11px] font-semibold leading-snug">
                              {activityText(item)}
                            </span>
                            <span className="mt-0.5 block font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                              {timeAgoFromSecs(item.at, t.library)}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* ===== Body grid ===== */}
        <div className="mt-5 grid grid-cols-12 gap-4">
          {/* ── Left column ─────────────────────────── */}
          <div className="col-span-12 flex flex-col gap-4 xl:col-span-8">
            {/* 3 colorful stat cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {statsCards.map((s, i) => (
                <div
                  key={i}
                  className={`${s.color} flex min-h-32 flex-col rounded-2xl p-4 text-[#16130c]`}
                >
                  <p className="text-[12px] font-extrabold leading-tight">
                    {s.title}
                    <span className="opacity-60"> ({s.count})</span>
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div>
                      <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-[#16130c]/65">
                        {s.label}
                      </p>
                      <p className="text-4xl font-extrabold leading-none tracking-tight">{s.value}</p>
                    </div>
                    <button
                      onClick={onViewAll}
                      aria-label={t.dashboard.viewAll}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16130c] text-[#f5f1e6] transition-transform hover:scale-110"
                    >
                      <ArrowUpRight size={18} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart card — real data */}
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">{t.dashboard.chartTitle}</h2>
                  <p className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {t.dashboard.chartSub}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-purple" />
                    {t.dashboard.legendCaptures}
                  </span>
                  <span className="rounded-md bg-card-2 px-2 py-1 font-mono text-[9px] font-bold uppercase">
                    {t.dashboard.chartTotal.replace("47", String(weekTotal))}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex h-44 items-end gap-2 sm:gap-3">
                {counts.map((count, i) => (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <span className="font-mono text-[9px] font-bold tabular-nums text-muted-foreground">
                      {count > 0 ? count : ""}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        i === counts.length - 1 ? "bg-gold" : "bg-foreground/80"
                      }`}
                      style={{ height: `${Math.max((count / weekMax) * 72, count > 0 ? 8 : 3)}%`, opacity: count > 0 ? 1 : 0.15 }}
                    />
                    <span
                      className={`font-mono text-[8px] font-bold uppercase ${
                        i === counts.length - 1 ? "text-foreground" : "text-muted-foreground/70"
                      }`}
                    >
                      {labels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row: recent captures list + storage */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Recent captures — real files */}
              <div className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-extrabold tracking-tight">{t.dashboard.recent}</h3>
                  <div className="flex items-center">
                    <div className="-space-x-2.5">
                      {recent.map((c) => (
                        <button
                          key={c.path}
                          onClick={() => onOpenCapture(c)}
                          title={c.name}
                          className="inline-block h-8 w-11 overflow-hidden rounded-lg bg-card-2 ring-2 ring-card transition-transform hover:-translate-y-0.5"
                        >
                          <img src={fileSrc(c.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={onQuickCapture}
                      aria-label={t.sidebar.quickCapture}
                      className="z-10 -ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-110"
                    >
                      <Plus size={15} strokeWidth={2.6} />
                    </button>
                  </div>
                </div>

                {listRows.length === 0 ? (
                  <p className="py-6 text-center font-mono text-[10px] font-medium text-muted-foreground">
                    {t.library.emptyAll}
                  </p>
                ) : (
                  <ul className="mt-2 divide-y divide-line">
                    {listRows.map((c) => (
                      <li
                        key={c.path}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-1.5 py-2 transition-colors hover:bg-card-2"
                        onClick={() => onOpenCapture(c)}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card-2 text-gold">
                          <ImageIcon size={16} strokeWidth={2.2} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-extrabold leading-tight">
                            {c.name}
                          </span>
                          <span className="mt-0.5 block font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                            {fileExt(c.name)} · {timeAgoFromSecs(c.modifiedSecs, t.library)}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-mono text-[9px] font-bold tabular-nums">
                            {formatBytesShort(c.sizeBytes)}
                          </span>
                          <span className="mt-0.5 block font-mono text-[8px] font-semibold text-muted-foreground">
                            {c.width && c.height ? `${c.width}×${c.height}` : "—"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <p className="font-mono text-[8.5px] font-bold uppercase leading-snug tracking-wider text-muted-foreground">
                    {t.dashboard.totalIndexed.replace("{n}", stats.count.toLocaleString(lang === "pt" ? "pt-BR" : "en-US"))}
                  </p>
                  <button onClick={onViewAll} className="btn btn-gold shrink-0 px-4 py-1.5 text-[10px] uppercase tracking-wide">
                    {t.dashboard.viewAll}
                  </button>
                </div>
              </div>

              {/* Storage — real folder stats */}
              <div className="card flex flex-col p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-extrabold tracking-tight">
                    {t.dashboard.stats.storage}
                  </h3>
                  <button onClick={onGoSettings} className="circle-btn h-9 w-9" aria-label={t.settings.title}>
                    <ArrowUpRight size={16} strokeWidth={2.3} />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: t.dashboard.storageUsed, value: formatBytes(stats.totalBytes) },
                    { label: t.dashboard.storageFiles, value: String(stats.count) },
                    { label: t.dashboard.storageFolder, value: folderBase(captureDir) },
                    { label: t.dashboard.storageFormat, value: captureFormat },
                  ].map((row) => (
                    <div key={row.label} className="min-w-0">
                      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="mt-0.5 truncate text-[15px] font-extrabold tracking-tight" title={String(row.value)}>
                        {row.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-auto flex items-center gap-1.5 border-t border-line pt-3 font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Folder size={11} strokeWidth={2.4} className="shrink-0" />
                  <span className="truncate" title={captureDir}>{captureDir}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                  <FolderOpen size={11} strokeWidth={2.4} className="shrink-0" />
                  {t.dashboard.folderNote}
                </p>
              </div>
            </div>
          </div>

          {/* ── Right rail: latest captures as action cards ──── */}
          <aside className="col-span-12 flex flex-col gap-3 xl:col-span-4">
            {recent.length === 0 ? (
              <div className="card flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card-2 text-gold">
                  <ImageIcon size={26} strokeWidth={1.8} />
                </span>
                <p className="text-[13px] font-extrabold">{t.library.emptyAll}</p>
                <p className="max-w-56 font-mono text-[9px] font-medium leading-relaxed text-muted-foreground">
                  {t.library.emptyAllDesc}
                </p>
                <button onClick={onQuickCapture} className="btn btn-gold mt-1 px-5 py-2.5 text-[10px] uppercase tracking-wide">
                  <Plus size={13} strokeWidth={2.75} />
                  {t.library.captureNow}
                </button>
              </div>
            ) : (
              recent.map((cap, i) => {
                const action = railActions[i % railActions.length];
                const ext = fileExt(cap.name);
                return (
                  <div key={cap.path} className="card relative p-3.5">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onOpenCapture(cap)}
                        className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-card-2 transition-transform hover:scale-[1.03]"
                        aria-label={cap.name}
                      >
                        <img src={fileSrc(cap.path)} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="truncate text-[12px] font-extrabold leading-snug tracking-tight" title={cap.name}>
                            {cap.name}
                          </p>
                          <button
                            className="icon-btn -mr-2 -mt-1 h-7 w-7 shrink-0"
                            onClick={() => setMenuFor(menuFor === cap.path ? null : cap.path)}
                            aria-label="Menu"
                            aria-expanded={menuFor === cap.path}
                          >
                            <MoreHorizontal size={16} strokeWidth={2.3} />
                          </button>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className={`tag-chip ${extChip[ext] ?? "tag-ref"}`}>#{ext}</span>
                          <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground">
                            {timeAgoFromSecs(cap.modifiedSecs, t.library)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="my-2.5 border-t border-line" />
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-mono text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Scrynx · {formatBytesShort(cap.sizeBytes)}
                      </p>
                      <button
                        onClick={() => action.act(cap)}
                        className={`btn ${action.cls} shrink-0 rounded-lg px-3.5 py-1.5 text-[9px] uppercase tracking-wide`}
                      >
                        {action.label}
                      </button>
                    </div>

                    {/* Card menu */}
                    {menuFor === cap.path && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setMenuFor(null)} />
                        <div className="animate-pop-in absolute right-3 top-11 z-30 w-48 overflow-hidden rounded-2xl bg-card-2 p-1.5 shadow-[var(--shadow)]">
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              onCopyImage(cap);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-colors hover:bg-card"
                          >
                            <Copy size={13} strokeWidth={2.4} /> {t.library.copyImage}
                          </button>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              onOpenCaptureFile(cap);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-colors hover:bg-card"
                          >
                            <FolderOpen size={13} strokeWidth={2.4} /> {t.dashboard.openShort}
                          </button>
                          <button
                            onClick={() => {
                              setMenuFor(null);
                              onDelete(cap);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-bold text-coral transition-colors hover:bg-card"
                          >
                            <Trash2 size={13} strokeWidth={2.4} /> {t.library.deleteOne}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}

            {/* Rail footer shortcut */}
            <button
              onClick={onViewAll}
              className="group flex items-center justify-between rounded-2xl bg-card px-4 py-3 text-left transition-colors hover:bg-card-2"
            >
              <span className="font-mono text-[9px] font-black uppercase leading-snug tracking-[0.2em] text-muted-foreground group-hover:text-foreground">
                {t.dashboard.emptyHint}
              </span>
              <ArrowRight size={14} strokeWidth={2.6} className="shrink-0 text-gold transition-transform group-hover:translate-x-1" />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
