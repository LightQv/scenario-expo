# Apple Music-Style Detail Banner Plan

## Goal

Replace the current React Native view-layer approximation of the detail banner color wash with a Skia-based artwork compositor that gets closer to Apple Music's fullscreen background treatment.

The target visual direction is:

- Multiple transformed copies of the artwork/backdrop.
- A composited blur over those copies, not several independent blurred React Native views.
- A richer, slightly oversaturated color wash.
- A controlled fade into the existing dynamic palette background.
- Existing visible image parallax preserved.
- Existing palette work preserved.

## Current State

The detail screen currently uses:

- `app/details/[id].tsx` for data loading and palette generation.
- `components/details/Banner.tsx` for the visible parallax artwork and fade.
- `services/detailPalette.ts` for dynamic palette extraction and contrast-safe color derivation.

The color palette is now in a good state:

- `palette.background` is selected from scored extracted image candidates.
- `palette.text` is a near-white, subtly tinted, contrast-safe primary text color.
- `palette.secondaryText` is derived from `palette.background` and scoped to cast roles and season metadata.
- `palette.surface` and `palette.tint` are derived from the selected background.
- Pills and detail controls use palette colors.

The visual limitation is now the banner transition:

- `Banner.tsx` uses multiple React Native image layers with `blurRadius`.
- These layers are independent views, not a real composited shader/blur surface.
- Saturation boosting is approximated through palette overlays.
- No fluid/twist distortion is possible with plain React Native views.
- The result is better than a flat fade, but still far from Apple Music.

## Why Skia

`@shopify/react-native-skia` is the most practical path because it allows us to render the artwork wash in one GPU-backed canvas.

With Skia we can:

- Draw multiple artwork copies into one surface.
- Apply transforms per copy.
- Apply blur/color filters to the composed result.
- Add gradient masks and overlays inside the same renderer.
- Later add animation or SkSL shader effects.

We should not start with custom Metal or native shader code. That would add unnecessary native complexity. Skia gives most of the benefit with significantly less risk.

## Source Reference

The relevant Apple Music behavior described in the referenced article:

- Apple Music Web uses stacked copies of album artwork.
- Copies are scaled around `25%`, `50%`, `80%`, and `125%` of viewport width.
- Some copies rotate in place.
- Smaller copies can move along circular tracks.
- A blur and saturation pass are applied after composition.
- Native Apple Music likely uses a Metal shader with twist/fluid distortion.

We will implement the same principle, not a perfect clone.

## Non-Goals For First Pass

- No custom Metal.
- No SkSL twist shader in the first implementation.
- No animation in the first implementation unless the static result is too flat.
- No replacement of the visible parallax image.
- No rewrite of the palette system.
- No Android-specific work, since the app config currently targets iOS only.

## Dependency Plan

Install Skia:

```sh
npx expo install @shopify/react-native-skia
```

Then verify:

```sh
npm run typecheck
npm run ios
```

If native build files need regeneration:

```sh
npx expo prebuild --platform ios
npm run ios
```

The project already has `newArchEnabled: true`, which is compatible with modern Skia setups.

## New Component

Create:

```txt
components/details/AppleMusicArtworkWash.tsx
```

Proposed props:

```ts
type AppleMusicArtworkWashProps = {
  imageUrl: string | undefined;
  palette: DetailPalette;
  scrollY: SharedValue<number>;
  height: number;
};
```

Responsibilities:

- Load the remote detail artwork into Skia.
- Draw transformed copies of the artwork.
- Apply blur and color treatment.
- Fade/mask the wash so it supports the banner transition.
- Stay behind the visible parallax artwork.

## Integration Point

Current `Banner.tsx` layer order should evolve to:

1. `palette.background` base container.
2. `AppleMusicArtworkWash` Skia canvas.
3. Existing visible parallax image layer.
4. Existing blurred bottom duplicate if still needed.
5. Existing dynamic palette fade.
6. Content.

The existing visible parallax image must remain intact:

```tsx
<Animated.View style={[styles.imageContainer, animatedImageStyle]}>
  <Image ... />
</Animated.View>
```

The Skia wash should be additive. It should not own the main parallax behavior.

## Image URL Handling

`Banner.tsx` currently receives `src`, then creates:

```ts
const imageSource = src
  ? { uri: `https://image.tmdb.org/t/p/original/${src}` }
  : undefined;
```

For Skia, also derive:

```ts
const imageUrl = src ? `https://image.tmdb.org/t/p/original/${src}` : undefined;
```

Pass `imageUrl` to `AppleMusicArtworkWash`.

## First-Pass Skia Composition

Use four artwork copies:

1. Backdrop/base wash
   - Size: `1.35x` to `1.6x` viewport width.
   - Position: centered.
   - Rotation: `0deg` or very slight `2deg`.
   - Opacity: moderate.

2. Small left/top copy
   - Size: `0.45x` to `0.6x` viewport width.
   - Position: left/top-mid.
   - Rotation: `-10deg`.
   - Opacity: medium.

3. Medium right copy
   - Size: `0.75x` to `0.9x` viewport width.
   - Position: right/mid-low.
   - Rotation: `8deg`.
   - Opacity: medium-low.

4. Large lower copy
   - Size: `1.1x` to `1.25x` viewport width.
   - Position: lower center.
   - Rotation: `-4deg`.
   - Opacity: medium.

After drawing copies:

- Apply saturation boost or color matrix if available.
- Apply blur to the group or to the drawing layer.
- Overlay `palette.tint` and `palette.background` gradients.
- Mask/fade vertically into the banner background.

## Skia Implementation Notes

The likely Skia primitives:

```ts
import {
  Canvas,
  Group,
  Image as SkiaImage,
  LinearGradient,
  Rect,
  useImage,
  vec,
} from "@shopify/react-native-skia";
```

Depending on installed Skia version, we can use:

- `useImage(imageUrl)` for remote image loading.
- `Group` with transform arrays.
- `Paint` / image filters for blur.
- `ColorMatrix` / color filters for saturation.
- `LinearGradient` overlays.

Exact API names should be checked against the installed version after dependency installation.

If group-level blur is awkward in the installed Skia API, fallback to:

- Draw copies with softened opacity.
- Add a blur-capable layer where supported.
- Keep a light React Native `blurRadius` fallback only if necessary.

## Parallax Preservation

The current parallax is controlled by:

```ts
const animatedImageStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
          [-BANNER_HEIGHT / 2, 0, BANNER_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  };
});
```

Do not change this in the first Skia pass.

For the Skia wash, there are two options:

1. Static wash
   - Simpler.
   - Lower risk.
   - Main image still carries parallax.

2. Light parallax wrapper
   - Wrap the Skia canvas in an `Animated.View` using a softer version of the same parallax.
   - Example: translate less than the main image.
   - Better integration, but one extra moving layer.

Recommended first implementation:

- Use a static wash.
- Keep current visible parallax untouched.
- If the wash feels detached, add a subtle animated wrapper after.

## Reduced Motion

First pass is static, so reduced motion is naturally supported.

If animation is added later:

- Respect `useReducedMotion` or platform accessibility settings.
- Avoid fast movement.
- Target slow, subtle drift.

## Phase 1: Static Skia Wash

Tasks:

1. Install `@shopify/react-native-skia`.
2. Add `AppleMusicArtworkWash.tsx`.
3. Render the Skia canvas behind the visible image in `Banner.tsx`.
4. Draw 4 artwork copies with static transforms.
5. Add blur/saturation treatment if supported cleanly.
6. Add palette tint/background overlays.
7. Remove the current React Native multi-copy wash from `Banner.tsx` once Skia wash is in place.
8. Keep existing visible image parallax and content layout unchanged.
9. Run typecheck and test on iOS simulator/device.

Success criteria:

- Detail page still loads.
- Parallax still works.
- The wash feels visibly richer than the current RN-layer attempt.
- Text remains readable.
- No severe frame drops on scroll.

## Phase 2: Light Motion

Only do this if phase 1 is visually promising.

Options:

- Animate copy rotation slowly.
- Animate copy position on circular tracks.
- Animate opacity subtly.

Suggested behavior:

- Use Reanimated shared values or Skia clock values.
- Keep FPS/performance in mind.
- Respect reduced motion.
- Motion should be almost imperceptible, closer to Apple Music's ambient feel than a visible animation.

Success criteria:

- No distracting motion.
- No scroll jank.
- No battery-heavy animation while page is hidden.

## Phase 3: Twist/Fluid Shader

Only attempt this after phase 1 and phase 2.

Potential implementation:

- Use SkSL runtime effect if supported by the installed Skia version.
- Implement a coordinate twist similar to:

```glsl
vec2 twist(vec2 coord, vec2 offset, float radius, float angle) {
  coord -= offset;
  float dist = length(coord);

  if (dist < radius) {
    float ratioDist = (radius - dist) / radius;
    float angleMod = ratioDist * ratioDist * angle;
    float s = sin(angleMod);
    float c = cos(angleMod);
    coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
  }

  coord += offset;
  return coord;
}
```

Risks:

- SkSL support/version constraints.
- More complex debugging.
- More device-specific behavior.

Do not start here.

## Phase 4: Remove Old Approximation

Once the Skia wash is accepted:

- Remove the current React Native `artworkWashContainer` and wash layer styles from `Banner.tsx`.
- Keep only:
  - Skia wash.
  - visible parallax image.
  - dynamic fade.
  - content.

If Skia fully handles fade/mask well, also simplify the old bottom blurred duplicate.

## Testing Checklist

Run:

```sh
npm run typecheck
npm run ios
```

Manual checks:

- Movie with bright/pale backdrop.
- Movie with dark blue/green backdrop.
- Movie with red/orange backdrop.
- TV show detail page.
- Person detail page.
- Pull-down parallax.
- Fast scroll past banner.
- Trailer/play controls.
- Light and dark system appearances.

Performance checks:

- Scroll should not stutter.
- Initial detail page load should not visibly block.
- Memory should not spike badly after browsing several detail pages.

## Rollback Plan

If Skia causes build or runtime issues:

1. Remove `AppleMusicArtworkWash` usage from `Banner.tsx`.
2. Keep current palette and standard banner layers.
3. Remove dependency only after confirming no imports remain.

Do not revert the palette improvements unless specifically needed. They are independent from Skia.

## Open Tuning Values

These should be tuned visually after first implementation:

- Number of artwork copies: `3` or `4`.
- Copy sizes: `0.5x`, `0.8x`, `1.25x`, `1.6x`.
- Blur radius / sigma.
- Saturation boost amount.
- Tint overlay opacity.
- Mask start and end positions.
- Whether Skia wash should lightly follow scroll.

## Recommended First Commit Scope

Keep the first implementation small:

- Install Skia.
- Add static `AppleMusicArtworkWash`.
- Integrate behind existing banner image.
- Remove only the current RN multi-copy wash, not the entire fade system.
- Verify typecheck and simulator launch.

Avoid mixing in animation or twist shader in the same commit.
