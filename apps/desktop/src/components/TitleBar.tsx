import { useEffect, useState } from "react";
import { Minus, Square, X, Copy as CopyIcon } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useI18n } from "../i18n";

/**
 * Scrynx — frameless, minimalist title bar.
 * Just the drag region and the three window controls (min / max / close).
 */
export function TitleBar() {
  const { t } = useI18n();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await getCurrentWindow().isMaximized();
        if (!cancelled) setMaximized(v);
      } catch {
        /* browser / not ready */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onMinimize = () => getCurrentWindow().minimize().catch(() => {});
  const onToggleMaximize = async () => {
    try {
      await getCurrentWindow().toggleMaximize();
      setMaximized((v) => !v);
    } catch {
      /* ignore */
    }
  };
  const onClose = () => getCurrentWindow().close().catch(() => {});

  const drag = (e: React.MouseEvent) => {
    if (e.button === 0) getCurrentWindow().startDragging().catch(() => {});
  };

  const windowButton =
    "flex h-full w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-card-2 hover:text-foreground";

  return (
    <div
      data-tauri-drag-region
      onMouseDown={drag}
      onDoubleClick={(e) => {
        e.preventDefault();
        onToggleMaximize();
      }}
      role="toolbar"
      aria-label="Scrynx title bar"
      className="flex h-9 shrink-0 select-none items-stretch justify-end"
    >
      <button
        onClick={onMinimize}
        aria-label={t.titlebar.minimize}
        title={t.titlebar.minimize}
        className={windowButton}
      >
        <Minus size={15} strokeWidth={2} />
      </button>
      <button
        onClick={onToggleMaximize}
        aria-label={maximized ? t.titlebar.restore : t.titlebar.maximize}
        title={maximized ? t.titlebar.restore : t.titlebar.maximize}
        className={windowButton}
      >
        {maximized ? (
          <CopyIcon size={12} strokeWidth={2} />
        ) : (
          <Square size={12} strokeWidth={2} />
        )}
      </button>
      <button
        onClick={onClose}
        aria-label={t.titlebar.close}
        title={t.titlebar.close}
        className="flex h-full w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-[#e81123] hover:text-white"
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
