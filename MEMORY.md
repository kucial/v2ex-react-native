# Project Environment

- Expo development-build React Native app with committed `ios/` and `android/` projects, Expo Router, Hermes, and the New Architecture/Fabric enabled.
- Current stack: React Native 0.86.2, Expo SDK 57, React 19.2.3, and TypeScript 6.0.3.
- Use pnpm 10.26.0: `pnpm install`, `pnpm start`, `pnpm ios`, `pnpm android`, `pnpm test`, and `pnpm lint`. The lint command runs ESLint with `--fix` and can modify files.
- `pnpm start` runs the custom Expo dev client on Metro port 8081. Optional Rozenite devtools are enabled with `WITH_ROZENITE=true`.
- Release commands are `pnpm build:ios`, `pnpm build:android`, `pnpm submit:ios`, and `pnpm submit:android`.
- iOS/iPadOS and Android are supported; the iOS deployment target defaults to 16.4 and the project includes an iOS widget extension. Web is not configured.
- iOS bundle identifier and Android package: `com.kucial.v2ex`; URL scheme: `r2v`.
- UI uses React Native `StyleSheet` plus `src/containers/ThemeService`. NativeWind is not installed despite stale references in README/AGENTS documentation.
- Tests use Jest 29 with `jest-expo`; linting uses ESLint 9, Prettier, and `simple-import-sort`. Verify visible mobile changes with the Argent device workflow.
- Environment configuration includes Sentry, Imgur, and analytics ingest variables from `.env.example`. After `.env` changes, restart Expo with cache clearing (`expo start -c --dev-client`).
