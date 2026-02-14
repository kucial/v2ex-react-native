# Repository Guidelines

## Project Structure & Module Organization
- `src/app` holds Expo Router entry points; screens and stacks live in `src/screens` and composed containers in `src/containers`.
- Shared UI is under `src/components`; shared logic sits in `src/hooks`, `src/stores` (Zustand), `src/lib`, and `src/utils` (with unit tests in `src/utils/__test__`).
- Static assets for the app live in `src/assets`; marketing images stay in `public/`. Native configs are under `android/` and `ios/`.
- Editor-related web tooling and experiments live in `packages/simple-slate-editor`; keep mobile app code in `src/`.
- Expo, Metro, Tailwind, and TypeScript configs are at the repo root; import aliases use `@/*` (see `tsconfig.json`).

## Build, Test, and Development Commands
- Use pnpm (`pnpm install`) to sync dependencies.
- Local dev client: `pnpm start` (Expo Dev Server), `pnpm ios`, or `pnpm android` to run on a device/simulator.
- CI-style checks: `pnpm lint` (ESLint + Prettier) and `pnpm test` / `pnpm test:watch` (Jest with `jest-expo`).
- Release flows: `pnpm build:ios` / `pnpm build:android` for EAS builds; `pnpm submit:ios` / `pnpm submit:android` for store submission.
- After updating `.env`, clear caches with `expo start -c --dev-client` to avoid stale config.

## Coding Style & Naming Conventions
- TypeScript first; prefer function components and hooks. Components use `PascalCase`; hooks start with `use`; utilities are camelCase.
- Stick to the `@/*` alias instead of long relative paths. Keep imports sorted automatically (`simple-import-sort`); let Prettier handle formatting (2-space indent, single quotes).
- Tailwind (via NativeWind) is allowed for layout; co-locate styles with components when practical. Avoid inline magic numbers—extract to constants where reused.

## Testing Guidelines
- Jest is the unit-test runner; existing suites live in `src/utils/__test__` and `packages/simple-slate-editor/**/tests`. Follow the `*.test.{js,ts}` pattern.
- Add focused unit tests for new utilities and parsing logic; for UI-heavy changes, cover pure helpers and stateful hooks.
- Keep tests deterministic (mock network and time) and prefer snapshot updates only when visual structure meaningfully changes.

## Commit & Pull Request Guidelines
- Commits use a conventional, imperative prefix seen in history (`feat:`, `fix:`, `dev:`); keep messages short and scoped.
- PRs should describe the user impact, list key changes, and link issues. Include iOS/Android screenshots or screen recordings for UI updates.
- Note any new env vars or config changes in the PR description; never commit secrets from `credentials/` or personal `.env` files.
