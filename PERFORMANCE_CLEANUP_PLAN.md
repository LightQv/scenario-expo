# Scenario Expo Performance And Cleanup Plan

## Goal

Ensure the mobile app loads cleanly, feels snappy, and stays technically clean without removing features or changing the product experience.

This plan prioritizes small, safe improvements first, then larger refactors where the codebase has clear duplication or runtime overhead.

## Current Baseline

- `npm run typecheck` passes.
- The app uses Expo Router, React Native, native tabs, Context providers, TMDB fetches, backend API fetches, and a custom iOS toast module.
- Package bloat is not severe: most heavy dependencies are used by existing features.
- The main risks are runtime behavior and maintainability rather than broken typing.

## Guiding Rules

- Preserve all existing features and visual behavior unless explicitly decided otherwise.
- Prefer small, measurable changes over broad rewrites.
- Keep public context/component APIs stable where possible.
- Keep existing Expo-native patterns: no axios, no Redux/Zustand, no unnecessary architecture change.
- Verify each phase independently with `npm run typecheck` and targeted app smoke tests.

## Phase 1: Startup And Splash Cleanup

### Problem

`app/_layout.tsx` loads many font files before hiding the splash screen:

- `AbrilFatface-Regular`
- `DelaGothicOne-Regular`
- `FiraSans-Regular`
- `FiraSans-Italic`
- `FiraSans-Thin`
- `FiraSans-ThinItalic`
- `FiraSans-Light`
- `FiraSans-LightItalic`
- `FiraSans-Medium`
- `FiraSans-MediumItalic`
- `FiraSans-Bold`
- `FiraSans-BoldItalic`

The actual app mostly references font names through `FONTS`, and most screen/UI usage appears to need only regular, medium, bold, and Abril at first paint.

### Plan

1. Audit actual `FONTS.*` usage across app/components/services.
2. Keep only the font files required for first paint in `useFonts`.
3. Either remove unused `FONTS` entries from `constants/theme/tokens.ts` or keep entries only if there is confirmed future usage.
4. If rare font variants are needed in a later route, consider lazy-loading them at that route boundary.

### Candidate First-Paint Font Set

- `AbrilFatface-Regular`
- `FiraSans-Regular`
- `FiraSans-Medium`
- `FiraSans-Bold`
- Keep `DelaGothicOne-Regular` only if a currently reachable screen uses `FONTS.dela`.

### Verification

- Run `npm run typecheck`.
- Cold launch the app and verify no font fallback flashes on discover, top, search, profile, details, and settings.
- Confirm splash hides correctly and no route renders with missing font warnings.

## Phase 2: Typed API Errors

### Problem

`services/instances.ts` throws generic `Error` strings like `API Error 403: ...`. Callers then inspect errors with `err.message.includes("403")` or similar string checks.

This is brittle and makes error handling noisy across contexts and screens.

### Plan

1. Add an `ApiError` class in `services/instances.ts`:
   - `status: number`
   - `body?: unknown`
   - `rawBody?: string`
2. Parse response body once in the fetch wrapper.
3. Throw `ApiError` for non-2xx responses.
4. Preserve current return behavior for successful empty responses (`null`) and JSON/text parsing.
5. Update context code first:
   - `UserContext`
   - `ViewContext`
   - `BookmarkContext`
   - `OwnedMediaContext`
   - `DownloadRequestContext`
6. Replace string checks with `error instanceof ApiError && error.status === 403`.

### Verification

- Run `npm run typecheck`.
- Test unauthenticated screens/actions that should ignore `403`.
- Test login/register failure messages.
- Test normal authenticated API operations.

## Phase 3: Provider Fetch Strategy

### Problem

Root layout globally mounts several providers:

- `UserProvider`
- `ViewProvider`
- `BookmarkProvider`
- `OwnedMediaProvider`
- `DownloadRequestProvider`
- `GenreProvider`

When authenticated, several providers can fetch on mount even if the first visible screen does not need their data. This increases startup network pressure and can make first interaction feel slower.

### Plan

1. Keep providers global for now to avoid routing/provider churn.
2. Add lightweight “loaded once” guards where repeated focus/mount fetches are unnecessary.
3. Defer expensive domain refreshes to the screens/actions that need them:
   - `DownloadRequestProvider` should not refresh all requests on app start unless a downloads UI/action needs it.
   - `OwnedMediaProvider` should avoid eager startup fetch unless details/profile/download screens need ownership state.
4. Keep `ViewProvider` and `BookmarkProvider` eager only if their data is needed on first visible authenticated UI. If not, defer or lazy-load when `ViewAction`, details controls, watchlist, or tab badge needs it.
5. Add explicit refresh calls to route-level screens where deferred data is needed.

### Candidate Changes

- Add `hasLoadedRef` or `lastLoadedAtRef` to providers to prevent duplicate immediate requests.
- Add `ensureOwnedMediaLoaded()` if owned media remains globally accessible.
- Add `ensureDownloadRequestsLoaded()` if downloads remain globally accessible.
- Keep public methods like `refreshOwnedMedia` and `refreshRequests` intact.

### Verification

- Use network logs to confirm app launch performs fewer requests.
- Verify details ownership badges still appear.
- Verify profile owned media count still appears.
- Verify downloads screen still fetches and polls active requests.
- Verify logout clears all domain state.

## Phase 4: Discover Screen Performance

### Problem

`app/(tabs)/discover/index.tsx` currently:

- Builds 12 sections in one component.
- Fires all section requests concurrently on mount.
- Renders all sections inside a vertical `Animated.ScrollView`.
- Each section renders a horizontal `FlatList`.

This creates heavy first-screen network pressure and non-virtualized vertical rendering.

### Plan

1. Extract section definitions and endpoint-building logic into a helper:
   - `services/discoverSections.ts` or `app/(tabs)/discover/discoverSections.ts`
2. Split sections into priority groups:
   - Priority 1: first visible/high-impact sections, such as trending and featured.
   - Priority 2: remaining discovery sections.
3. Load priority sections first, render them, then load the remaining sections after initial render.
4. Avoid firing all 12 TMDB requests at exactly the same time.
5. Consider a simple concurrency limiter if staged loading is not enough.
6. Convert vertical `ScrollView` to a virtualized section list if rendering cost remains visible.

### Candidate Section Priority

- Priority 1:
  - `trending-week`
  - `featured-movie`
  - `popular-movies`
- Priority 2:
  - `trending-persons`
  - `now-playing-movies`
  - `highly-rated-movies`
  - `upcoming-movies`
  - `top-rated-tv`
  - `tv-upcoming`
  - `top-rated-japanimation`
  - `top-rated-random-genre`
  - `movies-2000s`

### Implementation Notes

- Preserve the current UI order unless explicitly changing it.
- If priority loading changes order temporarily, use per-section loading states so layout remains stable.
- Keep pull-to-refresh behavior: refresh all sections, but still stage network requests.

### Verification

- Run `npm run typecheck`.
- Cold-open Discover on simulator.
- Verify first cards appear sooner.
- Pull to refresh and confirm all sections reload.
- Navigate to each section detail and verify query params still match existing behavior.

## Phase 5: Pure Derived Genre Hook

### Problem

`hooks/useGenre.tsx` stores derived genre names in state with `useEffect`. Every media card using this hook may render once with `null`, then render again when derived names are set.

### Plan

1. Replace local state/effect with `useMemo`.
2. Return derived genre names directly from `movieGenres`, `tvGenres`, `loading`, `data.genre_ids`, and media type.
3. Keep the public hook signature unchanged.

### Expected Benefit

- Fewer card re-renders.
- Simpler hook code.
- Less state churn in lists.

### Verification

- Run `npm run typecheck`.
- Verify genre labels still display in discover, top, search results, and category grids.

## Phase 6: Profile Statistics Parallel Fetch

### Problem

`app/profile/index.tsx` fetches statistics sequentially:

- Movie count
- TV count
- Movie runtime
- TV runtime/count

These requests are independent and can run in parallel.

### Plan

1. Replace sequential `await` calls with `Promise.all`.
2. Keep result transformation unchanged.
3. Ensure `loading` is set in `finally`.

### Verification

- Run `npm run typecheck`.
- Open profile and verify statistics match previous values.
- Test slow network behavior if possible.

## Phase 7: Watchlist Duplicate Initial Fetch

### Problem

`app/(tabs)/watchlist/index.tsx` fetches watchlists in both:

- `useEffect` on `user?.id`
- `useFocusEffect`

On first mount, this can duplicate the initial request.

### Plan

1. Use only `useFocusEffect` for screen-driven fetches, or keep mount fetch and skip the first focus fetch with a ref.
2. Prefer a single focused fetch path because watchlists should refresh after modal changes.
3. Keep pull-to-refresh unchanged.

### Verification

- Run `npm run typecheck`.
- Open watchlist tab and confirm a single first-load request.
- Create/edit/delete a watchlist and confirm returning to the tab refreshes data.

## Phase 8: Shared Compact Media Row

### Problem

These components duplicate most of the same layout:

- `components/views/ViewMediaCard.tsx`
- `components/watchlist/WatchlistMediaCard.tsx`
- `components/owned/OwnedMediaCard.tsx`

They all render:

- Container with adaptive background.
- Poster link.
- Text link.
- Title.
- Subtitle metadata.
- Optional viewed indicator.
- Optional trailing menu/action.

### Plan

1. Add a shared component, for example `components/ui/CompactMediaRow.tsx`.
2. Props should cover only the common layout:
   - `tmdbId`
   - `mediaType`
   - `posterPath`
   - `title`
   - `subtitle`
   - `backgroundColor?`
   - `textColor?`
   - `secondaryTextColor?`
   - `leadingAdornment?`
   - `trailingAdornment?`
3. Refactor `ViewMediaCard`, `WatchlistMediaCard`, and `OwnedMediaCard` to compose `CompactMediaRow`.
4. Keep each domain component responsible for domain-specific metadata and menu behavior.

### Verification

- Run `npm run typecheck`.
- Verify view list, watchlist detail, and owned media lists look unchanged.
- Verify all row links still navigate to details.
- Verify trailing menus still work.

## Phase 9: Shared Collection Context Logic

### Problem

`ViewContext` and `BookmarkContext` share a similar CRUD/query pattern:

- Fetch collection for authenticated user.
- Add item.
- Remove item.
- Check by TMDB ID and media type.
- Get item by TMDB ID and media type.
- Clear on logout.

The duplication makes future fixes easy to miss.

### Plan

1. Add an internal reusable hook/helper, for example `hooks/useApiMediaCollection.ts`.
2. Keep public context APIs unchanged.
3. Parameterize only what differs:
   - Collection name.
   - Fetch URL.
   - Add URL.
   - Delete URL builder.
   - Optimistic item creation.
   - Viewer ID filtering behavior for views.
4. Refactor `ViewContext` first.
5. Refactor `BookmarkContext` second.

### Verification

- Run `npm run typecheck`.
- Test marking media viewed/unviewed from cards and details.
- Test bookmarking/unbookmarking from details.
- Confirm watchlist tab badge still updates.
- Confirm logout clears both views and bookmarks.

## Phase 10: Detail Screen Heavy Work

### Problem

`app/details/[id].tsx` performs detail fetch, palette extraction, and TV availability refresh. The visual treatment is rich, but palette extraction and Skia artwork can add cost.

### Plan

1. Keep the existing visual behavior.
2. Ensure the main details data can render with fallback palette immediately after TMDB response.
3. Apply image-derived palette after extraction completes instead of blocking first details render.
4. Keep palette cache in `services/detailPalette.ts`.
5. Consider gating the Skia artwork wash behind a reduced-motion/performance setting only if profiling shows it is a real problem.

### Verification

- Run `npm run typecheck`.
- Open movie, TV, and person details.
- Verify details content appears quickly with no blank wait for palette extraction.
- Verify palette updates cleanly when extraction completes.
- Verify reduced motion still disables repeating artwork motion.

## Phase 11: Search Screen Responsiveness

### Problem

Search already debounces preview requests and guards stale responses, which is good. Potential cleanup remains around animated layout and genre rendering.

### Plan

1. Keep current debounce behavior.
2. Verify no preview request fires when search is inactive or query is empty.
3. Use stable render callbacks for genre items and preview rows if measurable re-renders appear.
4. Keep `FlatList` for genre grid.
5. Avoid changing `GlassView` unless profiling shows it is expensive on target devices.

### Verification

- Run `npm run typecheck`.
- Type quickly and verify stale results do not overwrite newer results.
- Switch media types during a query.
- Open result details.
- Clear and reload search history.

## Phase 12: Dependencies And Assets

### Problem

No obvious unused package bloat was found. However, there are some cleanup candidates:

- `.DS_Store` files exist under assets.
- Heavy dependencies like `@shopify/react-native-skia` should remain only if the details artwork wash is kept.
- Font files should match actual loaded/used fonts.

### Plan

1. Remove committed `.DS_Store` files from the Expo app if they are tracked.
2. Ensure `.gitignore` covers `.DS_Store`.
3. Recheck dependency usage after feature cleanup.
4. Do not remove dependencies just because they are heavy if they power active features.

### Verification

- Run `npm run typecheck`.
- Run `npm install` only if dependencies change.
- If dependency changes happen, run iOS build or at least `expo run:ios` when practical.

## Phase 13: Logging And Production Hygiene

### Problem

There are many `console.error` statements. This is useful during development but noisy in production if not managed.

### Plan

1. Decide whether to keep direct console logging or add a small logging utility.
2. If adding a utility, keep it minimal:
   - `logError(scope, error)`
   - No external dependency.
   - No behavior change in development.
   - Optional no-op or reduced output in production.
3. Replace only repeated noisy patterns after typed API errors are introduced.

### Verification

- Run `npm run typecheck`.
- Trigger known API errors and confirm user-facing toast behavior is unchanged.

## Suggested Implementation Order

1. Typed `ApiError`.
2. Font startup cleanup.
3. `useGenre` pure memo refactor.
4. Profile parallel statistics.
5. Watchlist duplicate fetch cleanup.
6. Discover staged loading.
7. Provider fetch deferral/loaded guards.
8. Shared compact media row.
9. Shared view/bookmark collection helper.
10. Detail palette render optimization.
11. Search and logging polish.
12. Dependency/assets cleanup.

This order starts with low-risk, high-confidence changes, then moves toward larger refactors.

## Smoke Test Checklist

Run after each phase that touches runtime code.

- Launch app cold.
- Discover tab loads and pull-to-refresh works.
- Top tab loads, filters work, infinite scroll works.
- Search opens, previews results, search results page works, genre page works.
- Details opens for movie, TV, and person.
- Login/register modal still works.
- Watchlist tab redirects when logged out and loads when logged in.
- Add/remove viewed status.
- Add/remove bookmarks.
- Profile loads statistics and banner.
- Downloads screen loads, active polling works, cancel/clean actions work.
- Settings screens open and save expected values.

## Verification Commands

```bash
npm run typecheck
npm run ios
```

Use `npm run ios` when native/runtime behavior needs validation. For pure TypeScript or small component refactors, `npm run typecheck` plus targeted simulator smoke tests is usually enough.

## Done Criteria

- App cold launch does not perform unnecessary domain fetches.
- Discover first content appears faster and no longer depends on all sections finishing.
- Card-heavy lists render with fewer avoidable re-renders.
- Duplicate media row and collection context logic is reduced without behavior changes.
- API error handling is typed and consistent.
- Typecheck passes after each phase.
- No feature is removed.
