# Testing

## Prerequisites

- Node.js 22+, npm 10+
- Rust toolchain (rustup): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- Tauri prerequisites: https://tauri.app/start/prerequisites/

```bash
npm install
```

## Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all frontend unit tests (no watch) |
| `npm run test:watch` | Watch mode for TDD workflow |
| `npm run test:coverage` | Generate HTML coverage report in `coverage/` |
| `npm run test:ci` | CI mode: headless, coverage, JUnit XML output |
| `npm run test:rust` | Run Rust unit tests (`cargo test`) |
| `npm run lint` | Biome lint check |
| `npm run typecheck` | TypeScript strict check (tsc --noEmit) |

## Test Structure

```
tests/
└── unit/
    ├── duration.test.ts    # Time formatting utilities
    └── export.test.ts      # CSV/JSON export formatting

src-tauri/src/
└── **/*.rs                 # Rust unit tests (inline #[cfg(test)] modules)
    ├── monitor/debounce.rs # Symmetric debounce FSM
    ├── commands/timer.rs   # Timer state management
    └── commands/export.rs  # Export formatting
```

## Coverage Targets

| Area | Target |
|------|--------|
| src/utils/ | 90%+ |
| src/hooks/ | 70%+ |
| src-tauri/ (Rust) | 80%+ |

## Running Locally (Zero Config)

```bash
git clone https://github.com/lanz-2024/smart-time-tracker
cd smart-time-tracker
npm install
npm test           # Frontend unit tests pass offline
npm run test:rust  # Rust tests pass offline
```

## Running in CI (GitHub Actions)

See `.github/workflows/ci.yml` for the full CI pipeline.

- Rust: `cargo clippy`, `cargo fmt --check`, `cargo test`
- TypeScript: Biome lint, `tsc --noEmit`, Vitest with coverage

## Debugging Failed Tests

- **Vitest failures**: Run `npm run test:watch` to filter interactively
- **Rust test output**: Use `cargo test -- --nocapture` to see println! output
- **Coverage gaps**: `npm run test:coverage` then open `coverage/index.html`
