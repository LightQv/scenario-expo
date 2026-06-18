# Native Search Workflow Implementation Plan

## Goal

Rebuild the Search tab to match the current native Apple Music search behavior using real native header/search primitives instead of custom React Native-drawn search controls.

The final Search tab should feel UIKit-native:

- Default state: large native `Search` title with a native search bar directly below it.
- Focused state: native title collapses/disappears, search bar moves into the top position, native close/cancel affordance appears.
- Empty focused state: type selector appears below the search bar, then recent searches.
- Typing state: live preview list appears in real time below the type selector.
- Full results remain on the existing full results route.

## Current State

The Search tab currently uses a custom React Native header in `app/(tabs)/search/index.tsx`:

- `TextInput` inside `GlassView` for the search bar.
- Custom circular close button inside `GlassView`.
- Manual `Animated.Value` header transition.
- Manual content padding based on safe area.
- Live preview list already exists via `components/search/SearchPreviewResults.tsx`.
- Full results still use `app/(tabs)/search/query.tsx`.

This is functional, but it does not look or behave like the native Apple Music search UI because the search field and close affordance are not native UIKit search controls.

## Target Native Architecture

Use Expo Router / React Native Screens native search integration:

- Use `Stack.SearchBar` in `app/(tabs)/search/index.tsx`.
- Use native stack header title/large title for the Search screen.
- Use `placement="stacked"` so the search bar sits under the title in the default state.
- Let UIKit handle the focused transition and close/cancel affordance.
- Keep content rendering in React Native below the native header.

## Native Search Bar Configuration

Recommended initial `Stack.SearchBar` configuration:

```tsx
<Stack.SearchBar
  placement="stacked"
  placeholder={i18n.t("screen.search.placeholder")}
  hideWhenScrolling={false}
  obscureBackground={false}
  autoCapitalize="none"
  onFocus={() => setSearchActive(true)}
  onBlur={() => setSearchActive(false)}
  onCancelButtonPress={handleCancelSearch}
  onChangeText={(event) => setQuery(event.nativeEvent.text)}
  onSearchButtonPress={handleShowAllResults}
/>
```

Notes:

- `Stack.SearchBar` is native and tied to the stack header.
- It automatically makes the header visible.
- On iOS 26, the cancel affordance is native and icon-style per `react-native-screens` docs.
- We should not draw our own search field or close button when using this.

## Header Configuration

Configure `app/(tabs)/search/_layout.tsx` or the screen itself so the Search index route owns a native header:

```tsx
<Stack.Screen
  name="index"
  options={{
    headerShown: true,
    headerLargeTitle: true,
    headerTransparent: false,
    headerShadowVisible: false,
    title: i18n.t("screen.search.title"),
  }}
/>
```

Open questions for iteration:

- Whether `headerLargeTitle` or `headerLargeTitleEnabled` is the accepted option in the current Expo Router SDK types.
- Whether `headerTransparent` should be `false` for native spacing and Apple Music behavior.
- Whether `headerBlurEffect` or other native options are needed after visual testing.

## Search Screen States

The Search screen should be driven by simple UI state:

```ts
type SearchDisplayState = "genres" | "history" | "preview";
```

State mapping:

- `genres`: search is not active, query is empty.
- `history`: search is active, query is empty.
- `preview`: search is active, query has text.

No content animation is required. UIKit handles the header/search bar animation. Content switches immediately.

## Content Behavior

### Default Genres

Render the existing genre grid:

- Use `GenreCard`.
- Keep two columns.
- Content should start naturally below the native header/search bar.
- Remove large manual safe-area offsets from the custom header implementation.

Expected content padding:

```ts
contentContainerStyle={{
  paddingTop: 12,
  paddingHorizontal: TOKENS.margin.horizontal,
  paddingBottom: 86,
}}
```

This may need tuning after simulator testing because native header height affects content inset behavior.

### Focused Empty Search

Render:

1. Full-width native SwiftUI `MediaTypePicker`.
2. `SearchHistory` below it.

No animation between genres and history.

### Focused Typing Search

Render:

1. Full-width native SwiftUI `MediaTypePicker`.
2. `SearchPreviewResults` below it.

The preview list should:

- Fetch after a short debounce, around `250ms`.
- Show only the first 10 results.
- Open details directly when a row is tapped.
- Show a `Show all results` row when there are preview results.

## Media Type Picker

Keep `components/search/MediaTypePicker.tsx` as the native SwiftUI segmented picker:

- Uses `@expo/ui/swift-ui` `Picker`.
- Uses `pickerStyle("segmented")`.
- Wrapped in `GlassView` or native glass if visually needed.

Desired sizing:

- Width: `100%`.
- Height: `38-40`.
- Top margin: compact, around `8-10`.
- Bottom margin before content: around `14-16`.

## Live Preview Search

Keep the existing live preview logic, but decouple it from custom header state.

Debounced fetch behavior:

- If query is empty, clear preview results.
- If media type changes while query exists, refetch preview.
- Use request ID or abort logic to avoid stale results.
- Fetch endpoint:
  - Person: `/search/person?query=${query}&language=${i18n.locale}&page=1`
  - Movie/TV: `/search/${mediaType}?query=${query}&include_adult=false&language=${i18n.locale}&page=1`
- Slice results to 10.

## Full Results Behavior

Keep `app/(tabs)/search/query.tsx` as the full results page.

Triggers:

- Native keyboard search button.
- `Show all results` preview row.

Behavior:

- Set search context query with the trimmed query.
- Navigate to `/(tabs)/search/query`.
- Existing query page saves successful searches to history.

Potential improvement later:

- Pass query/type as URL params instead of relying on layout context, so full results survive reload/deep link better.

## Direct Preview Navigation

Preview rows should navigate directly to details:

```tsx
router.push({
  pathname: "/details/[id]",
  params: {
    id: item.id.toString(),
    type: item.media_type || mediaType,
  },
});
```

This supports:

- Movie details.
- TV details.
- Person details.

Person detail routing is already supported by `app/details/[id].tsx` with `type="person"`.

## Files To Modify

Primary files:

- `app/(tabs)/search/_layout.tsx`
- `app/(tabs)/search/index.tsx`
- `components/search/MediaTypePicker.tsx`
- `components/search/SearchPreviewResults.tsx`

Files likely unchanged:

- `app/(tabs)/search/query.tsx`
- `app/(tabs)/search/[genreId].tsx`
- `components/search/SearchHistory.tsx`
- `components/search/GenreCard.tsx`
- `services/searchHistory.ts`

Translation files only if copy changes:

- `public/locales/en/translation.json`
- `public/locales/fr/translation.json`

## Implementation Phases

### Phase 1: Native Header And Search Bar

- Remove custom `SearchHeader` from `app/(tabs)/search/index.tsx`.
- Remove imports no longer needed:
  - `TextInput`
  - custom header `Animated` usage if no longer needed elsewhere
  - `GlassView` for search field
  - custom close button `TouchableOpacity` code
- Add `Stack.SearchBar` to `index.tsx`.
- Configure native Search screen title/large title.
- Verify typecheck.

### Phase 2: Content State Cleanup

- Replace custom animated content offsets with simple content containers.
- Render genres/history/preview based on search state.
- Ensure keyboard behavior does not hide content unexpectedly.
- Verify typecheck.

### Phase 3: Type Selector Placement

- Keep `MediaTypePicker` below native search bar when search is active.
- Tune height/width/margins.
- Verify it visually matches the Apple Music segmented control proportion.

### Phase 4: Live Preview Polish

- Keep preview debounce.
- Keep direct row navigation.
- Keep `Show all results` route to full results page.
- Tune row height, thumbnail shape, separators, and typography to better match native iOS list style.

### Phase 5: Simulator Review

Test these flows:

1. Open Search tab.
2. Confirm native large title and search bar spacing.
3. Tap search bar.
4. Confirm UIKit search transition and native close affordance.
5. Confirm type selector appears full-width under search bar.
6. Confirm recent searches appear with no content animation.
7. Type a query.
8. Confirm preview results load live.
9. Tap a preview item.
10. Confirm details page opens.
11. Tap `Show all results`.
12. Confirm full results page opens.
13. Tap native cancel/close.
14. Confirm Search tab returns to genre grid.

## Acceptance Criteria

- Search bar is native, not a custom `TextInput` drawn inside React Native layout.
- Close/cancel affordance is native, not a custom button.
- Header transition is native UIKit behavior, not manual React Native animation.
- Default Search page matches Apple Music structure: title, search bar, then content.
- Focused Search page matches Apple Music structure: search bar, close affordance, selector, then list.
- Content changes without animation.
- Live preview works while typing.
- Full results route still works.
- TypeScript passes with `PATH="/opt/homebrew/bin:$PATH" rtk npm run typecheck`.

## Risks And Constraints

- `Stack.SearchBar` placement and native behavior are controlled by UIKit/react-native-screens. Exact spacing may be less customizable than the custom header.
- `Stack.SearchBar` is tied to the native stack header, so fully custom positioning is not available without losing native behavior.
- iOS 26 behavior differs from earlier iOS versions, especially around search bar placement and cancel affordance.
- If `Stack.SearchBar placement="stacked"` does not visually match Apple Music enough, the fallback is a small custom native SwiftUI module that wraps `UISearchTextField`/`UISearchController`, but that is more work and should only be considered after testing the built-in native option.

## Rollback Plan

If native `Stack.SearchBar` cannot satisfy the layout:

1. Keep the current live preview/result architecture.
2. Replace only the search input with a dedicated local native SwiftUI/UIKit search component.
3. Keep content state unchanged.
4. Avoid returning to `TextInput + GlassView` for the final UI if native fidelity is required.
