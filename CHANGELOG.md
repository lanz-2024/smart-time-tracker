# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed
- Align Vite dev server port with Tauri `devUrl` — both now use port 1420 (Vite was defaulting to 5173, causing Tauri to time out waiting for the frontend)
- Add missing `src/App.tsx` — React root was not mounting (blank screen)
- Fix `useKeyboardShortcut` called with no args — crash on mount causing blank screen
- Fix `index.css` — replace `theme()` calls invalid in Tailwind v4 with hex values
- Fix Rust: add missing `store/mod.rs`, `monitor/process_detector.rs`, fix `to_string_lossy()` on `&str`
- Replace non-existent `image-default` Tauri feature with `image-png` + `image-ico`
- Add app icons required by `generate_context!()` macro at compile time
- Replace `pnpm` with `npm` in `tauri.conf.json` `beforeDevCommand`/`beforeBuildCommand` — fixes dev startup when pnpm is not installed
- Add `passWithNoTests: true` to `vitest.config.ts` — prevents Vitest from exiting non-zero when no test files exist yet
- Add missing `src/test-setup.ts` referenced by Vitest config

### Added
- `package-lock.json` — generated via `npm install`
- `src/utils/duration.test.ts` — unit tests for all duration utility functions (16 tests)

### Docs
- Update README quick start, test, and build commands from `pnpm` to `npm`
