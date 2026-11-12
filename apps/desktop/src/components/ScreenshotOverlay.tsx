import { useCallback, useEffect, useRef, useState } from "react";
import { Crop, Monitor, X, Loader2, MousePointer2 } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { emit } from "@tauri-apps/api/event";
import { useI18n } from "../i18n";
import { inTauri, logActivity, getCaptureDir, defaultCaptureDir, type CaptureMeta } from "../lib/bridge";

type Mode = "region" | "full";

interface DragRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function normalize(d: DragRect) {
  const x = Math.min(d.x1, d.x2);
  const y = Math.min(d.y1, d.y2);
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(Math.abs(d.x2 - d.x1)),
    height: Math.round(Math.abs(d.y2 - d.y1)),
  };
}

function readCaptureSettings() {
  try {
    const raw = localStorage.getItem("scrynx-settings");
    const parsed = raw ? (JSON.parse(raw) as { format?: string; quality?: number }) : {};
    return {
      format: typeof parsed.format === "string" ? parsed.format : "png",
      quality: typeof parsed.quality === "number" ? parsed.quality : 85,
    };
  } catch {
    return { format: "png", quality: 85 };
  }
}

/**
 * Snipping-Tool style overlay: the frozen screen is shown dimmed, a badge on
 * top offers region vs full-screen capture, drag to select, Esc to cancel.
 */
export function ScreenshotOverlay() {
  const { t } = useI18n();
  const [shot, setShot] = useState<{ url: string; width: number; height: number } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [mode, setMode] = useState<Mode>("region");
  const [drag, setDrag] = useState<DragRect | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    if (!inTauri) return;
    (async () => {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const frozen = await invoke<{ imageBase64: string; mime: string; width: number; height: number }>(
          "capture_screen_frozen",
        );
        setShot({
          url: `data:${frozen.mime};base64,${frozen.imageBase64}`,
          width: frozen.width,
          height: frozen.height,
        });
      } catch {
        setLoadError(true);
      }
    })();
  }, []);

  const close = useCallback(() => {
    if (inTauri) getCurrentWindow().close().catch(() => {});
  }, []);

  // Reveal the overlay as soon as it has mounted — no invisible fullscreen window
  useEffect(() => {
    if (inTauri) getCurrentWindow().show().catch(() => {});
  }, []);

  const captureSettings = readCaptureSettings();

  const finishCapture = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      if (!inTauri || !shot) return;
      setSaving(true);
      setSaveError(false);
      (async () => {
        try {
          const dir =
            (await getCaptureDir().catch(() => null)) ??
            (await defaultCaptureDir());
          const { invoke } = await import("@tauri-apps/api/core");
          const meta = await invoke<CaptureMeta>("capture_region", {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            scale: dpr,
            dir,
            format: captureSettings.format,
            quality: captureSettings.quality,
          });
          await logActivity("capture_saved", meta.name, "lime");
          await emit("scrynx://capture-saved", meta);
          await getCurrentWindow().close();
        } catch {
          setSaveError(true);
          setSaving(false);
        }
      })();
    },
    [shot, dpr],
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || saving) return;
    if (mode === "full") {
      // capture the whole frozen screen
      const w = Math.round(shot ? shot.width / dpr : window.innerWidth);
      const h = Math.round(shot ? shot.height / dpr : window.innerHeight);
      finishCapture({ x: 0, y: 0, width: w, height: h });
      return;
    }
    setDrag({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    setDrag((d) => (d ? { ...d, x2: e.clientX, y2: e.clientY } : d));
  };

  const onMouseUp = () => {
    setDrag((d) => {
      if (!d) return null;
      const rect = normalize(d);
      if (rect.width >= 6 && rect.height >= 6) finishCapture(rect);
      return null;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const rect = drag ? normalize(drag) : null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 select-none overflow-hidden bg-[#0b0b10]"
      style={{ cursor: "crosshair" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      role="presentation"
    >
      {/* Frozen screen background */}
      {shot && (
        <img
          src={shot.url}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        />
      )}
      {!shot && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 backdrop-blur">
            <Loader2 size={14} className="animate-spin" />
            {t.overlay.loading}
          </span>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full border border-red-400/40 bg-red-950/70 px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-red-300">
            {t.overlay.failed}
          </span>
        </div>
      )}

      {/* Selection marquee — the box-shadow dims everything outside it */}
      {rect && rect.width > 2 && rect.height > 2 && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(5, 5, 10, 0.58)",
          }}
        >
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <rect
              x="1"
              y="1"
              width={Math.max(rect.width - 2, 2)}
              height={Math.max(rect.height - 2, 2)}
              fill="none"
              stroke="#facc15"
              strokeWidth="2"
              strokeDasharray="8 6"
              className="marching-ants"
            />
          </svg>
          {/* Size label */}
          <div
            className="absolute left-0 top-full mt-2 whitespace-nowrap rounded-md border border-white/10 bg-black/75 px-2 py-1 font-mono text-[10px] font-bold text-yellow-300 backdrop-blur"
          >
            {rect.width} × {rect.height}
          </div>
        </div>
      )}
      {/* Dim layer when there is no selection yet */}
      {!rect && shot && <div className="pointer-events-none absolute inset-0 bg-black/45" />}

      {/* ── Top badge — capture modes (Snipping Tool style) ── */}
      <div className="pointer-events-auto absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/70 p-1.5 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => setMode("region")}
          aria-pressed={mode === "region"}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
            mode === "region" ? "bg-yellow-400 text-black" : "text-white/70 hover:text-white"
          }`}
        >
          <Crop size={14} strokeWidth={2.5} />
          {t.overlay.modeRegion}
        </button>
        <button
          onClick={() => setMode("full")}
          aria-pressed={mode === "full"}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-colors ${
            mode === "full" ? "bg-yellow-400 text-black" : "text-white/70 hover:text-white"
          }`}
        >
          <Monitor size={14} strokeWidth={2.5} />
          {t.overlay.modeFull}
        </button>

        <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" />
        <span className="hidden items-center gap-2 pr-2 font-mono text-[9px] font-bold uppercase tracking-widest text-white/40 sm:flex">
          <MousePointer2 size={11} />
          {t.overlay.hint}
        </span>

        {/* Status / cancel */}
        {saving ? (
          <span className="flex items-center gap-2 rounded-full bg-yellow-400/15 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-yellow-300">
            <Loader2 size={14} className="animate-spin" />
            {t.overlay.saving}
          </span>
        ) : saveError ? (
          <span className="rounded-full bg-red-500/20 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-red-300">
            {t.overlay.failed}
          </span>
        ) : (
          <button
            onClick={close}
            aria-label="Close"
            title="Esc"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}
