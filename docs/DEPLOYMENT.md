# Deployment

smart-time-tracker is a desktop application distributed as native installers.

## Build Prerequisites

- Node.js 22+, npm 10+
- Rust toolchain: `rustup install stable`
- Tauri CLI: `cargo install tauri-cli`
- Platform-specific dependencies: https://tauri.app/start/prerequisites/

## Local Development Build

```bash
npm install
npm run tauri:dev   # Hot-reload desktop window
```

## Production Build

```bash
npm run tauri:build
```

Artifacts appear in `src-tauri/target/release/bundle/`:

| Platform | Artifact | Location |
|----------|---------|----------|
| macOS | `.dmg` installer | `bundle/dmg/` |
| macOS | `.app` bundle | `bundle/macos/` |
| Windows | `.msi` installer | `bundle/msi/` |
| Windows | `.exe` NSIS | `bundle/nsis/` |

## GitHub Actions CI/CD

See `.github/workflows/ci.yml`. The workflow:
- **PR checks**: Rust clippy + fmt + test, TypeScript lint + typecheck + Vitest
- **Release builds**: triggered manually or on tag push (e.g., `v0.1.0`)

### Code Signing

For distribution, macOS apps require codesigning with an Apple Developer ID certificate. For this demo, builds are unsigned — macOS Gatekeeper will prompt on first launch. See README for bypass instructions.

## Auto-Update

The app checks GitHub Releases API (`/repos/lanz-2024/smart-time-tracker/releases/latest`) for updates. Configure in `src-tauri/tauri.conf.json` under `updater`.

## Distribution

1. Create a GitHub Release with a semver tag (e.g., `v0.1.0`)
2. Upload the built artifacts as release assets
3. Update the `updater.endpoints` in `tauri.conf.json` to point to your release endpoint
