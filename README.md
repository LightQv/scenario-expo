<div align="center">

<img src="assets/images/icon.png" alt="Scenario icon" width="96" height="96" />

# SCENARIO EXPO

Expo Router mobile client for discovering, tracking, and organizing movies and TV shows.

[About](#about) · [Setup](#setup) · [Development](#development) · [Configuration](#configuration) · [Platform Notes](#platform-notes) · [Archive and Restore](#archive-and-restore) · [Related Projects](#related-projects) · [License](#license)

</div>

---

## About

Scenario Expo is the mobile client for the Scenario movie and TV tracking application.

It integrates with TMDB for media discovery and with Scenario API for authenticated user data. The app supports discovery, search, details pages, watchlists, viewing history, profile data, and statistics through an Expo Router navigation structure.

Core components:

- Expo SDK and React Native
- Expo Router file-based navigation
- TypeScript application code
- Native fetch wrappers for Scenario API and TMDB
- Context-based state for authentication, themes, genres, and views
- Platform-aware styling with `PlatformColor`
- Expo Image, Reanimated, SecureStore, and native iOS-oriented UI components

---

## Setup

Clone the repository:

```bash
git clone https://github.com/LightQv/scenario-expo.git
cd scenario-expo
```

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.sample .env
```

---

## Development

Start the Expo development server:

```bash
npm start
```

Start with the development client:

```bash
npm run dev
```

Run on iOS:

```bash
npm run ios
```

Run on Android:

```bash
npm run android
```

Run TypeScript checks:

```bash
npm run typecheck
```

Regenerate the iOS native project:

```bash
npm run ios:prebuild
```

Clean and rebuild iOS dependencies:

```bash
npm run rebuild:ios
```

---

## Configuration

Configuration is loaded through Expo environment variables.

Required variables:

- `EXPO_ENV`: environment selector
- `EXPO_API_URL_ANDROID`: Scenario API URL for Android development
- `EXPO_API_URL_IOS`: Scenario API URL for iOS development
- `EXPO_API_URL`: Scenario API URL for production
- `EXPO_TMDB_API_KEY`: TMDB API key
- `EXPO_TMDB_API_TOKEN`: TMDB API bearer token
- `EXPO_WEB_CLIENT_URL`: Scenario Web URL for links and cross-client flows

See `.env.sample` for the expected local configuration shape.

---

## Platform Notes

The app is built around native Expo and React Native primitives.

- API calls use native `fetch`, not Axios.
- Authentication integrates with the Scenario API HTTPOnly cookie flow.
- Secure local values use Expo SecureStore where appropriate.
- Images use `expo-image` with blur placeholders and transitions.
- Styling uses iOS system colors through `PlatformColor` where supported.
- Navigation uses Expo Router file-based routes.
- Internationalization uses `i18n-js` with English and French translations.

---

## Project Structure

```text
app/
├── (tabs)/       # Tab navigation screens
├── details/      # Media detail routes
├── profile/      # Profile screens
└── season/       # TV season routes

components/
├── actions/      # Watchlist and viewing actions
├── details/      # Detail screen components
├── discover/     # Discovery lists and media cards
├── profile/      # Profile components
├── search/       # Search components
├── toasts/       # Toast notifications
├── ui/           # Shared UI components
├── views/        # Viewing history components
└── watchlist/    # Watchlist components

contexts/
├── GenreContext.tsx
├── ThemeContext.tsx
├── UserContext.tsx
└── ViewContext.tsx

services/
├── config.ts
├── i18n.ts
├── instances.ts
├── searchHistory.ts
├── utils.ts
└── validators.ts
```

---

## Related Projects

- [Scenario PWA](https://github.com/LightQv/scenario-pwa) — maintained browser-native successor
- [Scenario API](https://github.com/LightQv/scenario-fast-api)
- [Scenario Web](https://github.com/LightQv/scenario-web-client)

---

## Archive and Restore

This native client is retained as the design reference for [Scenario PWA](https://github.com/LightQv/scenario-pwa). Archiving on GitHub makes the repository read-only; unarchive it in repository settings before resuming pushes or maintenance.

For space-efficient local storage, only regenerable dependencies/caches are removed: `node_modules`, `.expo`, `ios/Pods` and `ios/build`. Source, assets, local modules, package manifests/lockfile, local environment files, native project files and `ios/Podfile.lock` are preserved. Generated native folders may contain local customizations, so they are **not** deleted wholesale.

Restore the locked JavaScript dependencies (including the existing `patch-package` postinstall):

```bash
npm ci
```

Then start the development server:

```bash
npm start
```

For a local iOS build, with Xcode and CocoaPods available:

```bash
npm run ios
```

Expo restores CocoaPods dependencies and build output as needed. Alternatively, run `pod install` inside the preserved `ios` directory first. A fresh clone does not include ignored native folders or local environment files: configure `.env` from `.env.sample` and run `npm run ios:prebuild` before building iOS. Do not use the clean-rebuild script merely to restore dependencies; it intentionally removes the CocoaPods lockfile and regenerates native projects.

---

## License

Scenario Expo is licensed under the MIT License. See [LICENSE](LICENSE).
