# Security

## Capability-Based Permissions (Tauri 2)

Tauri 2 uses a capability-based permission system. The frontend can only call
Rust commands that are explicitly listed in `src-tauri/capabilities/default.json`.

No filesystem, shell, or OS access is granted unless declared.

## Data Storage

All data is stored locally on the user's machine:
- Time entries: SQLite via Tauri plugin-store (no cloud sync by default)
- Settings: `src-tauri/capabilities/` + plugin-store
- No accounts, no authentication, no data sent to remote servers

## Process Monitoring

The app reads process names and CPU usage via the `sysinfo` Rust crate to detect
active applications. It does NOT:
- Read process memory
- Capture screenshots or keylogging
- Access documents or file contents

Only process names and CPU usage percentages are read.

## Input Detection

Keyboard/mouse activity detection uses OS-level idle time APIs:
- macOS: `IOHIDGetParameter` via `CoreGraphics`
- Windows: `GetLastInputInfo`

No keystrokes or mouse positions are recorded — only whether input occurred
within a configurable time window.

## Auto-Update

Update checks are made to GitHub's public API (HTTPS). Signature verification
is performed on update packages before installation (Tauri updater built-in).

## Screensaver Prevention

When the timer is active, the app prevents sleep using:
- macOS: `IOPMAssertionCreateWithName` (power assertion)
- Windows: `SetThreadExecutionState(ES_CONTINUOUS | ES_DISPLAY_REQUIRED)`

This is disabled when the timer is stopped or paused.
