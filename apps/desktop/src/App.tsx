import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Maximize2, X, ArrowUpCircle } from "lucide-react";
import { LanguageProvider, useI18n } from "./i18n";
import { LogoMark } from "./components/Logo";
import { Sidebar, type Page } from "./components/Sidebar";
import { TitleBar } from "./components/TitleBar";
import { Dashboard } from "./pages/Dashboard";
import { Library } from "./pages/Library";
import { Settings } from "./pages/Settings";
import { Onboarding, type OnboardingResult } from "./components/Onboarding";
import { ScreenshotOverlay } from "./components/ScreenshotOverlay";
import {
  inTauri,
  type CaptureMeta,
  type FolderStats,
  type LocalProfile,
  listCaptures,
  folderStats,
  deleteCaptureFile,
  copyImageToClipboard,
  openPath,
  pickFolder,
  getOnboarded,
  setOnboarded,
  getCaptureDir,
  setCaptureDir,
  getProfile,
  setProfile,
  defaultCaptureDir,
  getActivity,
  getActivityLastRead,
  markActivityRead,
  logActivity,
  setFavorite,
  fileSrc,
  checkForUpdate,
  installUpdate,
} from "./lib/bridge";

const FALLBACK_DIR = "C:\\Users\\Administrator\\Pictures\\Scrynx";

/* ============================== Splash ============================== */

function Splash() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-background">
      <div className="animate-pulse-dot">
        <LogoMark size={72} />
      </div>
      <p className="font-mono text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">
        Scrynx
      </p>
    </div>
  );
}

/* ============================== Root gate ============================== */

function Root() {
  const [boot, setBoot] = useState<
    | { status: "loading" }
    | { status: "onboarding"; fallbackDir: string }
    | { status: "ready"; captureDir: string; profile: LocalProfile | null }
  >({ status: "loading" });

  useEffect(() => {
    (async () => {
      const [onb, dir, prof] = await Promise.all([
        getOnboarded().catch(() => false),
        getCaptureDir().catch(() => null),
        getProfile().catch(() => null),
      ]);
      const fallbackDir = dir ?? (await defaultCaptureDir().catch(() => FALLBACK_DIR));
      if (onb) setBoot({ status: "ready", captureDir: fallbackDir, profile: prof ?? null });
      else setBoot({ status: "onboarding", fallbackDir });
    })();
  }, []);

  const handleDone = useCallback(async (result: OnboardingResult) => {
    await setCaptureDir(result.captureDir);
    if (result.accountMode === "local" && result.name) {
      await setProfile({ name: result.name, email: result.email });
      await logActivity("profile_saved", result.name, "purple");
    } else {
      await setProfile(null);
    }
    await logActivity("folder_changed", undefined, "gold");
    await setOnboarded();
    setBoot({
      status: "ready",
      captureDir: result.captureDir,
      profile: result.accountMode === "local" ? { name: result.name, email: result.email } : null,
    });
  }, []);

  if (boot.status === "loading") return <Splash />;
  if (boot.status === "onboarding")
    return <Onboarding initialDir={boot.fallbackDir} onDone={handleDone} />;
  return <Shell initialDir={boot.captureDir} initialProfile={boot.profile} />;
}

/* ============================== App shell ============================== */

function Shell({
  initialDir,
  initialProfile,
}: {
  initialDir: string;
  initialProfile: LocalProfile | null;
}) {
  const { t, lang } = useI18n();
  const [page, setPage] = useState<Page>("dashboard");
  const [captureDir, setCaptureDirState] = useState(initialDir);
  const [profile, setProfileState] = useState<LocalProfile | null>(initialProfile);
  const [captures, setCaptures] = useState<CaptureMeta[]>([]);
  const [stats, setStats] = useState<FolderStats>({ count: 0, totalBytes: 0 });
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [capturing, setCapturing] = useState(false);
  const overlayOpenRef = useRef(false);
  const lastShortcutRef = useRef(0);
  const [previewCapture, setPreviewCapture] = useState<CaptureMeta | null>(null);
  const previewTimer = useRef<number | undefined>(undefined);
  const [updateVersion, setUpdateVersion] = useState<string | null>(null);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [collapseOverride, setCollapseOverride] = useState<boolean | null>(() => {
    const v = localStorage.getItem("scrynx-sidebar-collapsed");
    return v === null ? null : v === "1";
  });
  const [primaryShortcut, setPrimaryShortcut] = useState(() => {
    try {
      const raw = localStorage.getItem("scrynx-settings");
      const parsed = raw ? (JSON.parse(raw) as { shortcuts?: string[] }) : null;
      return parsed?.shortcuts?.[0] ?? "Ctrl + Shift + S";
    } catch {
      return "Ctrl + Shift + S";
    }
  });
  const [autoCollapsed, setAutoCollapsed] = useState(
    () => window.matchMedia("(max-width: 1120px)").matches,
  );
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1120px)");
    const onChange = () => setAutoCollapsed(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Explicit user choice wins; otherwise follow the viewport
  const collapsed = collapseOverride ?? autoCollapsed;
  const toggleCollapse = useCallback(() => {
    setCollapseOverride((prev) => {
      const current = prev ?? window.matchMedia("(max-width: 1120px)").matches;
      const next = !current;
      try {
        localStorage.setItem("scrynx-sidebar-collapsed", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const notify = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  /* ------------------------- data loading -------------------------- */

  const refreshCaptures = useCallback(async () => {
    const [list, s] = await Promise.all([
      listCaptures(captureDir).catch(() => [] as CaptureMeta[]),
      folderStats(captureDir).catch(() => ({ count: 0, totalBytes: 0 })),
    ]);
    setCaptures(list);
    setStats(s);
  }, [captureDir]);

  const refreshActivity = useCallback(async () => {
    const [items, lastRead] = await Promise.all([
      getActivity().catch(() => []),
      getActivityLastRead().catch(() => 0),
    ]);
    setUnread(items.filter((i) => i.at > lastRead).length);
  }, []);

  useEffect(() => {
    void refreshCaptures();
    void refreshActivity();
  }, [refreshCaptures, refreshActivity]);

  // Silent update check on startup — banner appears only if an update exists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const update = await checkForUpdate();
      if (!cancelled && update) setUpdateVersion(update.version);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInstallUpdate = useCallback(async () => {
    setInstallingUpdate(true);
    const result = await installUpdate();
    setInstallingUpdate(false);
    if (result === "installed") {
      notify(t.toasts.updateInstalled);
    } else if (result === "error") {
      notify(t.settings.updateFailed);
    }
  }, [notify, t]);

  // Re-sync when the window regains focus (e.g. files changed in Explorer)
  useEffect(() => {
    const onFocus = () => {
      void refreshCaptures();
      // The overlay may have closed (cancelled) without saving — release everything
      setCapturing(false);
      overlayOpenRef.current = false;
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCaptures]);

  /* --------------------------- actions ----------------------------- */

  const openCaptureOverlay = useCallback(async () => {
    if (overlayOpenRef.current) return; // immediate guard — beats key repeat
    if (!inTauri) {
      notify(t.toasts.captureNativeOnly);
      return;
    }
    // Never stack overlays — focus the existing one instead
    try {
      const { WebviewWindow, getAllWebviewWindows } = await import(
        "@tauri-apps/api/webviewWindow"
      );
      const existing = await getAllWebviewWindows();
      const current = existing.find((w) => w.label === "capture-overlay");
      if (current) {
        await current.setFocus().catch(() => {});
        return;
      }

      overlayOpenRef.current = true;
      const win = new WebviewWindow("capture-overlay", {
        url: window.location.origin + "/index.html#/overlay",
        title: "Scrynx — Capture",
        fullscreen: true,
        decorations: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focus: true,
        // Start hidden — the overlay page reveals itself once mounted
        visible: false,
      });
      win.once("tauri://error", () => {
        overlayOpenRef.current = false;
      });
      setCapturing(true);
    } catch (err) {
      overlayOpenRef.current = false;
      notify(err instanceof Error ? err.message : String(err));
    }
  }, [notify, t]);

  const toggleFavorite = useCallback(
    async (cap: CaptureMeta) => {
      await setFavorite(cap.name, !cap.favorite);
      setCaptures((prev) =>
        prev.map((c) => (c.path === cap.path ? { ...c, favorite: !cap.favorite } : c)),
      );
      await logActivity(
        cap.favorite ? "favorite_removed" : "favorite_added",
        cap.name,
        "purple",
      );
      await refreshActivity();
    },
    [refreshActivity],
  );

  const deleteCapture = useCallback(
    async (cap: CaptureMeta) => {
      try {
        await deleteCaptureFile(cap.path);
      } catch (err) {
        notify(err instanceof Error ? err.message : String(err));
        return;
      }
      setCaptures((prev) => prev.filter((c) => c.path !== cap.path));
      setStats((prev) => ({
        count: Math.max(0, prev.count - 1),
        totalBytes: Math.max(0, prev.totalBytes - cap.sizeBytes),
      }));
      if (selectedPath === cap.path) setSelectedPath(null);
      await logActivity("capture_deleted", cap.name, "coral");
      await refreshActivity();
      notify(t.toasts.deleted);
    },
    [notify, refreshActivity, selectedPath, t],
  );

  const deleteMany = useCallback(
    async (items: CaptureMeta[]) => {
      for (const cap of items) {
        try {
          await deleteCaptureFile(cap.path);
        } catch {
          /* continue with the rest */
        }
      }
      setSelectedPath(null);
      await refreshCaptures();
      items.forEach((i) => void logActivity("capture_deleted", i.name, "coral"));
      await refreshActivity();
      notify(t.toasts.deletedMany.replace("{n}", String(items.length)));
    },
    [notify, refreshActivity, refreshCaptures, t],
  );

  const copyImage = useCallback(
    async (cap: CaptureMeta) => {
      if (!inTauri) {
        notify(t.toasts.captureNativeOnly);
        return;
      }
      try {
        await copyImageToClipboard(cap.path);
        notify(t.toasts.copied);
      } catch (err) {
        notify(err instanceof Error ? err.message : String(err));
      }
    },
    [notify, t],
  );

  const openCaptureFile = useCallback((cap: CaptureMeta) => {
    if (inTauri) openPath(cap.path).catch(() => {});
  }, []);

  const pickCaptureFolder = useCallback(async () => {
    const picked = await pickFolder(t.settings.folderRow);
    if (!picked) return;
    if (inTauri) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("ensure_capture_dir", { dir: picked });
      } catch (err) {
        notify(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    await setCaptureDir(picked);
    setCaptureDirState(picked);
    await logActivity("folder_changed", undefined, "gold");
    await refreshActivity();
    notify(t.toasts.folderChanged);
  }, [notify, refreshActivity, t]);

  const openCaptureDir = useCallback(() => {
    if (inTauri) openPath(captureDir).catch(() => {});
  }, [captureDir]);

  const saveProfile = useCallback(
    async (next: LocalProfile | null) => {
      await setProfile(next);
      setProfileState(next);
      await logActivity(next ? "profile_saved" : "profile_removed", next?.name, "purple");
      await refreshActivity();
      notify(next ? t.toasts.profileSaved : t.toasts.profileRemoved);
    },
    [notify, refreshActivity, t],
  );

  const goToLibrary = useCallback(() => setPage("library"), []);
  const openCapture = useCallback((cap: CaptureMeta) => {
    setSelectedPath(cap.path);
    setPage("library");
  }, []);
  const goToSettings = useCallback(() => setPage("settings"), []);
  const markAllRead = useCallback(async () => {
    await markActivityRead();
    setUnread(0);
    notify(t.toasts.allRead);
  }, [notify, t]);

  // Listen for captures finished by the overlay window (any monitor of this app)
  useEffect(() => {
    if (!inTauri) return;
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<CaptureMeta>("scrynx://capture-saved", (event) => {
          void refreshCaptures();
          void refreshActivity();
          setCapturing(false);
          overlayOpenRef.current = false;
          // Quick preview — floating thumbnail, like Snipping Tool
          let quickPreview = true;
          try {
            const raw = localStorage.getItem("scrynx-settings");
            if (raw) quickPreview = (JSON.parse(raw) as { quickPreview?: boolean }).quickPreview !== false;
          } catch {
            /* keep default */
          }
          if (quickPreview) {
            setPreviewCapture(event.payload);
            window.clearTimeout(previewTimer.current);
            previewTimer.current = window.setTimeout(() => setPreviewCapture(null), 5000);
          }
          notify(t.toasts.captureSaved);
        });
      } catch {
        /* overlay events unavailable */
      }
    })();
    return () => {
      unlisten?.();
      window.clearTimeout(previewTimer.current);
    };
  }, [refreshCaptures, refreshActivity, notify, t]);

  /* ------------------ global shortcut (real, OS-wide) ------------------ */

  // "Ctrl + Shift + S" → "CommandOrControl+Shift+S"
  const toPluginSpec = (display: string): string =>
    display
      .split("+")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const upper = part.toUpperCase();
        if (upper === "CTRL" || upper === "CONTROL") return "CommandOrControl";
        if (upper === "META" || upper === "CMD" || upper === "WINDOWS") return "Super";
        if (upper === "SHIFT") return "Shift";
        if (upper === "ALT") return "Alt";
        return upper.length === 1 ? upper : part;
      })
      .join("+");

  const globalShortcutActive = useRef(false);

  useEffect(() => {
    if (!inTauri) return;
    const spec = toPluginSpec(primaryShortcut);
    if (!spec) return;
    let cancelled = false;

    (async () => {
      try {
        const { register, unregisterAll } = await import("@tauri-apps/plugin-global-shortcut");
        await unregisterAll();
        if (cancelled) return;
        await register(spec, (event) => {
          if (event.state !== "Pressed") return;
          const now = Date.now();
          if (now - lastShortcutRef.current < 600) return; // ignore key-repeat / double-fire
          lastShortcutRef.current = now;
          void openCaptureOverlay();
        });
        if (!cancelled) globalShortcutActive.current = true;
      } catch {
        globalShortcutActive.current = false;
        notify(t.toasts.shortcutFailed);
      }
    })();

    return () => {
      cancelled = true;
      globalShortcutActive.current = false;
    };
    // openCaptureOverlay identity changes only when its inputs change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryShortcut]);

  /* ----------------------- global hotkeys -------------------------- */

  // Window-level fallback — only fires when the global registration failed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey) {
        if (e.code === "KeyS") {
          if (globalShortcutActive.current) return; // the OS shortcut already handled it
          const now = Date.now();
          if (now - lastShortcutRef.current < 600) return;
          lastShortcutRef.current = now;
          e.preventDefault();
          void openCaptureOverlay();
        } else if (e.code === "KeyL") {
          e.preventDefault();
          setPage("library");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openCaptureOverlay]);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  /* ----------------------------- UI -------------------------------- */

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <TitleBar />
      {updateVersion && (
        <div className="flex h-10 shrink-0 items-center justify-center gap-3 border-b border-gold/40 bg-gold px-4 text-[#16130c]">
          <ArrowUpCircle size={15} strokeWidth={2.6} />
          <span className="text-[11px] font-extrabold">
            {t.settings.updateBanner.replace("{v}", updateVersion)}
          </span>
          <button
            onClick={handleInstallUpdate}
            disabled={installingUpdate}
            className="flex items-center gap-1.5 rounded-full bg-[#16130c] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-gold transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {installingUpdate ? "…" : t.settings.updateBannerCta}
          </button>
        </div>
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
      <Sidebar                                                          
        page={page}
        onNavigate={setPage}
        captureCount={captures.length}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onQuickCapture={openCaptureOverlay}
        onGoPro={() => notify(t.toasts.proSoon)}
        capturing={capturing}
      />

      {page === "dashboard" && (
        <Dashboard
          captures={captures}
          stats={stats}
          captureDir={captureDir}
          unread={unread}
          onQuickCapture={openCaptureOverlay}
          onDelete={deleteCapture}
          onViewAll={goToLibrary}
          onOpenCapture={openCapture}
          onOpenCaptureFile={openCaptureFile}
          onCopyImage={copyImage}
          onGoSettings={goToSettings}
          onActivityRead={markAllRead}
        />
      )}
      {page === "library" && (
        <Library
          captures={captures}
          selectedPath={selectedPath}
          onSelect={setSelectedPath}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteCapture}
          onDeleteMany={deleteMany}
          onCopyImage={copyImage}
          onOpenFile={openCaptureFile}
          onQuickCapture={openCaptureOverlay}
        />
      )}
      {page === "settings" && (
        <Settings
          onNotify={notify}
          captureDir={captureDir}
          onPickFolder={pickCaptureFolder}
          onOpenCaptureDir={openCaptureDir}
          profile={profile}
          onSaveProfile={saveProfile}
          onPrimaryShortcutChange={setPrimaryShortcut}
        />
      )}
      </div>

      {/* Quick preview — floating thumbnail after a capture, Snipping-Tool style */}
      {previewCapture && (
        <div className="animate-toast-in fixed bottom-24 right-5 z-40 w-60 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow)]">
          <button
            className="block h-28 w-full overflow-hidden bg-card-2"
            onClick={() => {
              if (inTauri) openPath(previewCapture.path).catch(() => {});
              setPreviewCapture(null);
            }}
            title={previewCapture.name}
            aria-label={previewCapture.name}
          >
            <img
              src={fileSrc(previewCapture.path)}
              alt={previewCapture.name}
              className="h-full w-full object-cover"
            />
          </button>
          <div className="flex items-center justify-between gap-2 p-2">
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-extrabold">{previewCapture.name}</span>
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                {t.toasts.captureSaved}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => {
                  if (inTauri) openPath(previewCapture.path).catch(() => {});
                  setPreviewCapture(null);
                }}
                className="icon-btn h-7 w-7"
                aria-label="Open"
              >
                <Maximize2 size={13} strokeWidth={2.4} />
              </button>
              <button onClick={() => setPreviewCapture(null)} className="icon-btn h-7 w-7" aria-label="Close">
                <X size={13} strokeWidth={2.4} />
              </button>
            </span>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-toast-in fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl border border-line bg-card py-2.5 pl-3 pr-4 shadow-[var(--shadow)]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold">
            <CheckCircle2 size={15} strokeWidth={3} className="text-[#1a1710]" />
          </span>
          <span className="max-w-72 text-[11px] font-extrabold leading-snug">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

/* ============================== Export ============================== */

export default function App() {
  const isOverlay =
    typeof window !== "undefined" && window.location.hash === "#/overlay";
  return (
    <LanguageProvider>{isOverlay ? <ScreenshotOverlay /> : <Root />}</LanguageProvider>
  );
}
