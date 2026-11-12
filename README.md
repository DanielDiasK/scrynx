<p align="center">
  <img src="apps/desktop/public/logo.svg" width="96" alt="Scrynx logo" />
</p>

<h1 align="center">Scrynx</h1>

<p align="center">
  <strong>Capture. Annotate. Organize.</strong><br/>
  An open-source screenshot tool for the desktop with a built-in capture manager.
</p>

<p align="center">
  <a href="https://github.com/DanielDiasK/scrynx/releases/latest"><img alt="release" src="https://img.shields.io/github/v/release/DanielDiasK/scrynx?display_name=tag" /></a>
  <a href="https://github.com/DanielDiasK/scrynx/actions/workflows/release.yml"><img alt="build" src="https://img.shields.io/github/actions/workflow/status/DanielDiasK/scrynx/release.yml?branch=main" /></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-yellow.svg" /></a>
  <a href="https://github.com/DanielDiasK/scrynx"><img alt="platform" src="https://img.shields.io/badge/platform-Windows%2010%2F11-blue.svg" /></a>
</p>

---

## What is Scrynx?

Scrynx is a screenshot app that goes beyond the print key: any capture mode, professional annotations, OCR, and a **built-in capture manager** — a dashboard where every print you take is indexed, searchable and organized.

- 🖥️ **Native desktop app** — Tauri v2 + Rust + React. Fast, native window, real Windows hotkeys.
- 🌐 **Landing page** in the same monorepo.
- 🔓 **Open source** — MIT licensed, local-first, no account required.
- ⚡ **Real screen capture** — `Ctrl+Shift+S` even with Scrynx hidden.

## Download

Grab the latest Windows installer from the [Releases page](https://github.com/DanielDiasK/scrynx/releases/latest). The app ships with auto-update: new versions install themselves in one click.

## Highlights

- **Capture modes** — full screen, region selection, window, scrolling page
- **Annotation tools** — arrows, text, blur, shapes, numbered steps
- **OCR** — extract and search text inside screenshots
- **Capture manager** — dashboard with search, tags, favorites, stats
- **Global hotkeys** — `Ctrl+Shift+S` from anywhere
- **Local-first** — your captures never leave your machine

## Structure

```
scrynx/
├─ apps/
│  ├─ landing/    # Public website (Vite + React + Tailwind)
│  └─ desktop/    # Desktop app (Tauri v2 + Rust + React + Tailwind)
│     └─ src-tauri/
├─ .github/workflows/release.yml   # CI: builds & publishes releases
├─ scripts/bump.mjs                # version bump helper
└─ package.json                    # bun workspaces
```

## Requirements

**Common:** [Bun](https://bun.sh/) + Node.js 20+ (only for the dev servers)

**Windows:**
- Rust toolchain → `winget install Rustlang.Rustup -e --accept-package-agreements`
- MSVC C++ Build Tools → `winget install --id Microsoft.VisualStudio.2022.BuildTools -e --override "--quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`
- WebView2 Runtime — already installed on Windows 10/11 (Edge)

## Commands

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `bun install`         | Install all workspace dependencies                                   |
| `bun run dev:app`     | **Open the native app** with hot reload                              |
| `bun run dev:landing` | Start the landing page dev server                                    |
| `bun run build`       | Build both frontends                                                 |
| `bun run build:app`   | Build & bundle the production installer                               |
| `bun run bump patch`  | Bump `tauri.conf.json` + `Cargo.toml` + `package.json`                |

```sh
# open the app
bun run dev:app
```

First launch takes a few minutes to compile the Rust backend; after that it is fast.

## Releasing

1. `bun run bump patch` (or `minor` / `major`)
2. `git add -A && git commit -m "chore: release vX.Y.Z" && git push`
3. The [Release workflow](.github/workflows/release.yml) builds the Windows installer, signs it with the updater key and publishes a GitHub Release — then rebuilds the landing page.

Users get a banner on next launch ("Scrynx vX.Y.Z is available") and update with one click. See `.github/workflows/release.yml` for details.

## Contributing

Issues and PRs welcome! Please keep the code style consistent (check existing files — no need to add a linter/prettier ceremony) and run `bun run build` before opening a PR.

## License

[MIT](./LICENSE) © 2026 Daniel Dias
