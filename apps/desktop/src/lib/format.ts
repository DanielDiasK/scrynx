/** Shared, locale-driven formatting helpers for real captured files. */

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function formatBytesShort(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface TimeTpl {
  timeNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
}

/** Render an absolute epoch-seconds timestamp as a relative label. */
export function timeAgoFromSecs(
  modifiedSecs: number,
  tpl: TimeTpl,
): string {
  const diffMins = Math.floor((Date.now() / 1000 - modifiedSecs) / 60);
  if (diffMins < 1) return tpl.timeNow;
  if (diffMins < 60) return tpl.minutesAgo.replace("{n}", String(diffMins));
  if (diffMins < 1440) return tpl.hoursAgo.replace("{n}", String(Math.floor(diffMins / 60)));
  return tpl.daysAgo.replace("{n}", String(Math.floor(diffMins / 1440)));
}

/** Absolute capture date, e.g. "12 nov 2026, 03:45" / "Nov 12, 2026, 03:45". */
export function formatCapturedAt(modifiedSecs: number, lang: "en" | "pt"): string {
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(modifiedSecs * 1000));
}
