# Changelog

All notable changes to smart-time-tracker are documented here.

## [0.1.0] - 2026-03-27

### Added
- Tauri 2 + React 19 + TypeScript desktop app scaffold
- System tray with minimize-to-tray and quit actions
- Timer: start, stop, pause, resume with elapsed time display
- Project and task management (local, no external dependencies)
- Time entry persistence via Tauri plugin-store
- Activity detection: dual-signal (process CPU + keyboard/mouse idle time)
- Symmetric debounce FSM: 3 active readings to start, 6 idle readings to pause
- Auto-pause on configurable idle threshold
- Screensaver prevention while timer is active (macOS + Windows)
- CSV and JSON export for time entries
- Light/Dark/System theme switching
- Compact floating timer mode
- Global keyboard shortcut for start/stop
- Vitest unit tests: duration utilities, export formatting
- Rust unit tests: debounce FSM, timer state, power management
- GitHub Actions CI: Rust (clippy + fmt + test) + TypeScript (lint + typecheck + Vitest)
- docs/: ARCHITECTURE.md (if present), TESTING.md, DEPLOYMENT.md, SECURITY.md, CHANGELOG.md

### Changed
- Replaced pnpm with npm for broader developer compatibility

### Fixed
- Resolved blank screen on startup
- Aligned Vite dev server port with Tauri devUrl (1420)
