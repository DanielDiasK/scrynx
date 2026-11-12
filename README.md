# Scrynx

**Scrynx** is a screenshot tool with a built-in capture manager (dashboard) — landing page + desktop app in one monorepo.

## Structure

```
scrynx/
├─ apps/
│  ├─ landing/    # Public website (Vite + React + Tailwind)
│  └─ desktop/    # Desktop app (Tauri v2 + React + Tailwind) — opens a NATIVE window
│     └─ src-tauri/
└─ package.json   # bun workspaces
```

## Requirements

**Common:** [Bun](https://bun.sh/) + Node.js 20+ (only for the landing/dev servers)

**Windows (desktop app):**
- Rust toolchain → `winget install Rustlang.Rustup -e --accept-package-agreements`
- MSVC C++ Build Tools → `winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`
- WebView2 Runtime — already installed on Windows 10/11 (Edge)

**Linux (desktop app):** Rust via rustup, plus the WebKitGTK dev packages:

```bash
# Debian / Ubuntu
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file gcc-c++ gtk3-devel libappindicator-gtk3-devel librsvg2-devel

# Arch
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget openssl appmenu-gtk-module libappindicator-gtk3 librsvg
```

## Commands

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `bun install`         | Install all workspace dependencies                                   |
| **`bun run dev:app`** | **`tauri dev` — compiles the Rust backend and opens the native app window** |
| `cd apps/desktop && npm run dev` | Same thing — the desktop's `dev` script IS `tauri dev`       |
| `cd apps/desktop && npm run dev:vite` | Frontend-only dev server on http://localhost:1420 (browser, no native window) |
| `bun run build:app`   | `tauri build` — produces the production installer/binary             |
| `bun run dev:landing` | Start the landing page dev server                                    |
| `bun run dev:desktop` | Same as `dev:app`                                                   |
| `bun run build`       | Type-check + build both frontends (CI-friendly, no Rust needed)     |
| `bun run tauri dev`   | Same as `dev:app`                                                   |

First `npm run dev` in `apps/desktop` takes a few minutes to compile the Rust
backend; after that the native window opens in seconds. Use `dev:vite` only for
quick frontend-only iteration in a browser.

## Notes

- **Capture flow (Windows Snipping-Tool style):** `Ctrl+Shift+S` — even with Scrynx hidden — opens a fullscreen overlay: the frozen screen is dimmed, a badge on top offers **Area** (drag a selection) or **Full screen** (one click), Esc cancels. The shot is saved to your chosen capture folder and immediately appears in the library (real thumbnails, real stats). A small preview floats bottom-right for a few seconds (disable in Ajustes).
- The desktop app currently ships with **mocked account/dashboard data** being phased out — captures, storage stats, chart, activity feed and favorites are all real, local-first.
- Both apps support **English** and **Português (Brasil)** — toggle in the UI (top-right of the landing, sidebar of the app, or Ajustes). Language choice persists.
- Design system: **neo-brutalism** on the **shadcn neutral palette** — light **and** dark mode (toggle in the UI, persisted, defaults to your OS preference), 2px borders, hard offset shadows, rounded corners, Archivo Black / Archivo / IBM Plex Mono (landing).

## App icons

`apps/desktop/icon-source.png` is the 1024×1024 master icon (rendered from `apps/desktop/public/logo.svg`).
To regenerate the full Tauri icon set (`.ico`, `.icns`, Appx/iOS/Android):

```sh
cd apps/desktop
bun add -d sharp && node scripts/make-icon.mjs   # re-render master from logo.svg
bunx tauri icon icon-source.png                  # regenerate src-tauri/icons/*
bun remove sharp
```
