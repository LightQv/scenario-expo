# Scenario Expo - Development Log

## Project Overview
Movie and TV show tracking application built with Expo and React Native. Integrates with TMDB API for media information.

## Recent Implementations

### Detail Page with Parallax Banner (2025-10-17)

Implemented a comprehensive detail view for movies and TV shows with the following features:

#### Files Created/Modified
- **`/app/details/[id].tsx`**: Main detail screen component
- **`/components/details/Banner.tsx`**: Parallax banner component with trailer button and rating
- **`/components/discover/MediaCard.tsx`**: Updated to link to detail screen with type parameter
- **`/public/locales/en/translation.json`** & **`/public/locales/fr/translation.json`**: Added trailer button translations

#### Key Features Implemented

**1. Dynamic Routing**
- Created dynamic route `/details/[id]` that accepts both `id` and `type` parameters
- Type parameter distinguishes between `movie` and `tv` endpoints for TMDB API

**2. Parallax Banner Effect**
- Implemented smooth parallax effect using React Native Reanimated
- Image scales and translates on scroll with specific interpolation formula:
  - Pull down: Image scales up to 2x and fills entire top area
  - Scroll up: Image translates and stays at scale 1
- Uses `useSharedValue` and `useAnimatedScrollHandler` (replaced deprecated `useScrollViewOffset`)

**3. Native iOS Header Pattern**
- Transparent header with native glass effect
- Simple back button using Pressable and Ionicons
- Configured with `useLayoutEffect` to avoid double header issues
- Matches discover page's native feel

**4. Trailer Button Integration**
- Finds first YouTube trailer from videos array (`type === "Trailer"` and `site === "YouTube"`)
- Smart deep linking:
  - Opens YouTube app if available (`vnd.youtube://watch?v=...`)
  - Falls back to in-app web browser (WebBrowser with PAGE_SHEET presentation)
- Positioned on left side with play icon

**5. Rating Display**
- TMDB rating out of 10 (divided by 2 for display)
- Shows star icon with score
- Positioned on right side with semi-transparent background
- Only displays if score is available

**6. Layout & Styling**
- Horizontal padding matches main title alignment (`TOKENS.margin.horizontal`)
- Gradient overlay for better text readability
- Animated gradient that fades out on scroll
- 500px banner height with proper overflow handling

#### Technical Details

**Data Fetching**:
```typescript
tmdbFetch(
  `/${type}/${id}?language=${i18n.locale}&append_to_response=videos,credits`
)
```

**Parallax Animation Formula**:
```typescript
translateY: interpolate(
  scrollY.value,
  [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
  [-BANNER_HEIGHT / 2, 0, BANNER_HEIGHT * 0.75]
),
scale: interpolate(
  scrollY.value,
  [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
  [2, 1, 1]
)
```

**YouTube Deep Linking**:
```typescript
const youtubeAppUrl = `vnd.youtube://watch?v=${trailer.key}`;
const canOpen = await Linking.canOpenURL(youtubeAppUrl);
if (canOpen) {
  await Linking.openURL(youtubeAppUrl);
} else {
  await WebBrowser.openBrowserAsync(youtubeUrl, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: THEME_COLORS.main,
  });
}
```

#### Design Decisions
- Keep header configuration in screen component (not layout) to avoid conflicts
- Use Expo SDK exclusively (no axios)
- Follow iOS native patterns for header and navigation
- Iterate step-by-step approach for feature implementation

#### Issues Resolved
1. ✅ Fixed deprecated `useScrollViewOffset` API usage
2. ✅ Resolved double header issue from layout approach
3. ✅ Corrected parallax effect to fill top on pull down
4. ✅ Removed unnecessary HeaderButton component with theme variables
5. ✅ Updated button positioning (trailer left, rating right)

#### Next Steps
The banner implementation is complete. Future iterations will add:
- Cast section
- Seasons (for TV shows)
- Screenshots gallery
- Streaming providers
- Recommendations

---

## Development Guidelines

### Tech Stack
- **Framework**: Expo SDK
- **Navigation**: expo-router (file-based routing)
- **Animations**: react-native-reanimated
- **API**: TMDB (native fetch, no axios)
- **Internationalization**: i18n-js
- **Typography**: Abril Fatface (titles), FiraSans (body)
- **Styling**: PlatformColor for native iOS feel

### Coding Standards
- Use TypeScript with strict typing
- Leverage Expo SDK components exclusively
- Follow iOS native design patterns
- Use PlatformColor for theme-aware colors
- Implement proper error handling with toast notifications
- Don't ask for i18n translations - implement and allow corrections later
