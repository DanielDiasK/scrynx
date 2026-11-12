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

## Releases & auto-update

The **Release** workflow (`.github/workflows/release.yml`) runs on every push to `main`:

1. Reads `version` from `tauri.conf.json`.
2. If a git tag `v<version>` already exists → **skips** (a code-only push does not ship).
3. Otherwise builds the Windows installer, **signs** it with the updater private key and publishes a **GitHub Release** + `latest.json` manifest.
4. Then it **rebuilds the landing** and deploys it to GitHub Pages (needs Pages enabled: repo → Settings → Pages → Source: GitHub Actions).

### Shipping an update

```sh
bun run bump patch        # bumps tauri.conf.json + Cargo.toml + desktop package.json
git add -A && git commit -m "chore: release vX.Y.Z" && git push
```

The workflow takes over: builds, signs, publishes. Users with an older version get a **gold banner** on next launch ("Scrynx vX.Y.Z disponível") — one click installs it (the app restarts on NSIS). Settings also has "Atualizações → Verificar agora".

### One-time setup (maintainer)

Add repo secrets (Settings → Secrets and variables → Actions):

- `TAURI_PRIVATE_KEY` — content of `apps/desktop/tauri-keys.key` (never committed)
- `TAURI_KEY_PASSWORD` — the key password

### Auto-update on a **private** repo — honest status

GitHub's `releases/latest/download/latest.json` endpoint requires *authentication* when the repo is private. The client updater ships no credentials, so:

- CI/releases/pages all work with the `GITHUB_TOKEN` from Actions ✅
- The in-app auto-update **only works once the repo is public** (or you host the manifest publicly elsewhere) ✅ one toggle, no code changes needed — the config already points there

If you want a public update channel while keeping the repo private, publish `apps/desktop/src-tauri/tauri.conf.json`'s endpoint behind any public HTTPS URL serving `latest.json`.

## Notes

- **Capture flow (Windows Snipping-Tool style):** `Ctrl+Shift+S` — even with Scrynx hidden — opens a fullscreen overlay: the frozen screen is dimmed, a badge on top offers **Area** (drag a selection) or **Full screen** (one click), Esc cancels. The shot is saved to your chosen capture folder and immediately appears in the library (real thumbnails, real stats). A small preview floats bottom-right for a few seconds (disable in Ajustes).
- Account/profile is **local-first** (name + email stored locally, no server) — cloud sync arrives with the Pro plan.
- Both apps support **English** and **Português (Brasil)** — toggle in the UI (top-right of the landing, sidebar of the app, or Ajustes). Language choice persists.
- Design system: **shared fintech language** with the desktop app — Manrope, tonal surfaces, gold/purple/lime accents, rounded corners, light and dark mode (persisted; defaults to your OS preference).

## App icons

`apps/desktop/icon-source.png` is the 1024×1024 master icon (rendered from `apps/desktop/public/logo.svg`).
To regenerate the full Tauri icon set (`.ico`, `.icns`, Appx/iOS/Android):

```sh
cd apps/desktop
bun add -d sharp && node scripts/make-icon.mjs   # re-render master from logo.svg
bunx tauri icon icon-source.png                  # regenerate src-tauri/icons/*
bun remove sharp
```
