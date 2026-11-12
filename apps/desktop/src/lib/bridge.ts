import { convertFileSrc } from "@tauri-apps/api/core";

/** True when running inside the native Tauri window. */
export const inTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/* ------------------------------- Data types ------------------------------- */

export interface CaptureMeta {
  path: string;
  name: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  /** Seconds since Unix epoch. */
  modifiedSecs: number;
  favorite: boolean;
}

export interface FolderStats {
  count: number;
  totalBytes: number;
}

export type ActivityAction =
  | "capture_saved"
  | "capture_deleted"
  | "favorite_added"
  | "favorite_removed"
  | "folder_changed"
  | "profile_saved"
  | "profile_removed";

export interface ActivityItem {
  id: string;
  action: ActivityAction;
  name?: string;
  at: number;
  tone: "gold" | "purple" | "lime" | "coral";
}

/* ------------------------------ Tauri invoke ------------------------------ */

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

export function defaultCaptureDir(): Promise<string> {
  if (!inTauri) return Promise.resolve("C:\\Users\\Administrator\\Pictures\\Scrynx");
  return invoke<string>("default_capture_dir");
}

/* ------------------------------ Auto-update ------------------------------ */

/** App version from Tauri (single source of truth: tauri.conf.json). */
export async function getAppVersion(): Promise<string> {
  if (!inTauri) return "0.1.0";
  try {
    const { getVersion } = await import("@tauri-apps/api/app");
    return await getVersion();
  } catch {
    return "0.1.0";
  }
}

/**
 * Check GitHub Releases for a newer version.
 * Returns `null` for "up to date" AND for any failure (offline, private repo, etc.).
 * Use `checkForUpdate({ throwOnError: true })` in Settings to see real errors.
 */
export async function checkForUpdate(): Promise<{ version: string } | null> {
  if (!inTauri) return null;
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    return update ? { version: update.version } : null;
  } catch {
    return null;
  }
}

export async function installUpdate(): Promise<"installed" | "none" | "error"> {
  if (!inTauri) return "error";
  try {
    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (!update) return "none";
    await update.downloadAndInstall();
    return "installed";
  } catch {
    return "error";
  }
}

/** Like checkForUpdate but throws on failure — for the Settings "check now" button. */
export async function checkForUpdateStrict(): Promise<{ version: string } | null> {
  const { check } = await import("@tauri-apps/plugin-updater");
  const update = await check();
  return update ? { version: update.version } : null;
}

export function captureScreen(
  dir: string,
  format: string,
  quality: number,
): Promise<CaptureMeta> {
  return invoke<CaptureMeta>("capture_screen", { dir, format, quality });
}

export async function listCaptures(dir: string): Promise<CaptureMeta[]> {
  if (!inTauri) return [];
  const raw = await invoke<Array<Omit<CaptureMeta, "favorite">>>("list_captures", { dir });
  const favorites = await getFavorites();
  return raw.map((c) => ({ ...c, favorite: favorites[c.name] === true }));
}

export function deleteCaptureFile(path: string): Promise<void> {
  return invoke<void>("delete_capture", { path });
}

export function folderStats(dir: string): Promise<FolderStats> {
  if (!inTauri) return Promise.resolve({ count: 0, totalBytes: 0 });
  return invoke<FolderStats>("folder_stats", { dir });
}

export function copyImageToClipboard(path: string): Promise<void> {
  return invoke<void>("copy_image_to_clipboard", { path });
}

/** Convert an absolute file path into a URL the webview can render. */
export function fileSrc(path: string): string {
  if (!inTauri) return path;
  return convertFileSrc(path);
}

/* --------------------------- Persistent store ------------------------------ */

interface StoreLike {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  save(): Promise<void>;
}

let storePromise: Promise<StoreLike> | null = null;

/** Store backed by tauri-plugin-store (native) or localStorage (browser dev). */
export function getStore(): Promise<StoreLike> {
  if (storePromise) return storePromise;

  storePromise = (async () => {
    if (inTauri) {
      const { load } = await import("@tauri-apps/plugin-store");
      return load("scrynx.json", { autoSave: 100 });
    }
    // Browser fallback — same semantics, localStorage-backed
    const key = (k: string) => `scrynx-store:${k}`;
    const shim: StoreLike = {
      async get<T>(k: string) {
        const raw = localStorage.getItem(key(k));
        return raw == null ? undefined : (JSON.parse(raw) as T);
      },
      async set(k: string, value: unknown) {
        localStorage.setItem(key(k), JSON.stringify(value));
      },
      async save() {},
    };
    return shim;
  })();

  return storePromise;
}

const DEFAULT_ACTIVITY: ActivityItem[] = [];
const ACTIVITY_KEY = "activity";
const ACTIVITY_LAST_READ_KEY = "activityLastRead";
const FAVORITES_KEY = "favorites";

export async function getActivity(): Promise<ActivityItem[]> {
  const store = await getStore();
  return (await store.get<ActivityItem[]>(ACTIVITY_KEY)) ?? DEFAULT_ACTIVITY;
}

export async function logActivity(
  action: ActivityAction,
  name: string | undefined,
  tone: ActivityItem["tone"] = "gold",
): Promise<void> {
  const store = await getStore();
  const current = (await store.get<ActivityItem[]>(ACTIVITY_KEY)) ?? [];
  const item: ActivityItem = {
    id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    action,
    name,
    at: Math.floor(Date.now() / 1000),
    tone,
  };
  const next = [item, ...current].slice(0, 30);
  await store.set(ACTIVITY_KEY, next);
}

export async function getActivityLastRead(): Promise<number> {
  const store = await getStore();
  return (await store.get<number>(ACTIVITY_LAST_READ_KEY)) ?? 0;
}

export async function markActivityRead(): Promise<void> {
  const store = await getStore();
  await store.set(ACTIVITY_LAST_READ_KEY, Math.floor(Date.now() / 1000));
}

export async function getFavorites(): Promise<Record<string, boolean>> {
  const store = await getStore();
  return (await store.get<Record<string, boolean>>(FAVORITES_KEY)) ?? {};
}

export async function setFavorite(name: string, favorite: boolean): Promise<void> {
  const store = await getStore();
  const favorites = await getFavorites();
  if (favorite) favorites[name] = true;
  else delete favorites[name];
  await store.set(FAVORITES_KEY, favorites);
}

/* ------------------------------ Onboarding ------------------------------ */

export interface LocalProfile {
  name: string;
  email: string;
}

export async function getOnboarded(): Promise<boolean> {
  const store = await getStore();
  return (await store.get<boolean>("onboarded")) === true;
}

export async function setOnboarded(): Promise<void> {
  const store = await getStore();
  await store.set("onboarded", true);
}

export async function getCaptureDir(): Promise<string | null> {
  const store = await getStore();
  return (await store.get<string>("captureDir")) ?? null;
}

export async function setCaptureDir(dir: string): Promise<void> {
  const store = await getStore();
  await store.set("captureDir", dir);
}

export async function getProfile(): Promise<LocalProfile | null> {
  const store = await getStore();
  return (await store.get<LocalProfile>("profile")) ?? null;
}

export async function setProfile(profile: LocalProfile | null): Promise<void> {
  const store = await getStore();
  if (profile) await store.set("profile", profile);
  else await store.set("profile", null);
}

/* ------------------------------ Folder picker ------------------------------ */

export async function pickFolder(title: string): Promise<string | null> {
  if (!inTauri) {
    // Browser fallback: no native dialog available
    return window.prompt(title, "C:\\Users\\Administrator\\Pictures\\Scrynx");
  }
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({ directory: true, multiple: false, title });
  return typeof selected === "string" ? selected : null;
}

/** Open a path with the OS default handler (Explorer, image viewer…). */
export async function openPath(path: string): Promise<void> {
  const { openPath } = await import("@tauri-apps/plugin-opener");
  return openPath(path);
}
