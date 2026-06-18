# Header Menu Migration Plan

## Context

After the Expo SDK 56 upgrade, several header-right menu buttons became inconsistent:

- Icon sizes are not visually aligned across screens.
- Some header-right buttons do not open on every tap.
- Filter/action menus no longer consistently feel like native iOS toolbar menus.
- Previous Liquid Glass-style menu behavior is partially lost.

The current implementation mostly uses `@expo/ui/swift-ui` `ContextMenu` with a raw `Image` as the trigger. This is likely the source of the regression.

## Root Cause

Expo UI SDK 56 distinguishes between two native menu patterns:

- `Menu`: opens on single tap. This is the correct component for toolbar/header dropdown actions.
- `ContextMenu`: intended for contextual or long-press interactions.

Most header menus currently use `ContextMenu`, for example:

```tsx
<Host style={styles.container}>
  <ContextMenu modifiers={[buttonStyle("plain")]}> 
    <ContextMenu.Items>{/* items */}</ContextMenu.Items>
    <ContextMenu.Trigger>
      <Image systemName="ellipsis" />
    </ContextMenu.Trigger>
  </ContextMenu>
</Host>
```

The trigger is also wrapped in very small fixed containers such as `width: 20` and `height: 26`, which creates unreliable hit targets in native navigation headers.

## Desired Direction

Use Expo UI SwiftUI `Menu` for header-right menus. It is closer to Apple Music-style toolbar dropdowns and supports native single-tap opening, SF Symbols, icon-only labels, and Liquid Glass button styles.

Reference API from Expo UI SDK 56:

```tsx
import { Host, Menu, Button } from "@expo/ui/swift-ui";
import { buttonStyle, labelStyle } from "@expo/ui/swift-ui/modifiers";

<Host matchContents>
  <Menu
    label="More"
    systemImage="ellipsis.circle"
    modifiers={[labelStyle("iconOnly"), buttonStyle("glass")]}
  >
    <Button label="Action" systemImage="gear" onPress={handleAction} />
  </Menu>
</Host>
```

Important Expo UI note: do not apply `glassEffect()` to the menu label to fake Liquid Glass. Use `buttonStyle("glass")` or `buttonStyle("glassProminent")` on `Menu` instead.

## Scope

### Header Menus To Migrate First

These appear in navigation headers and should use single-tap `Menu`:

- `components/ui/FiltersMenu.tsx`
- `components/views/ViewHeaderMenu.tsx`
- `components/watchlist/WatchlistMenu.tsx`
- `components/watchlist/WatchlistDetailMenu.tsx`
- `components/profile/ProfileMenu.tsx`
- `components/details/DetailsActionsMenu.tsx`

### Card Menus To Leave For Later

These are inside list/card rows and may still be appropriate as contextual controls:

- `components/views/ViewMediaCardMenu.tsx`
- `components/watchlist/WatchlistMediaCardMenu.tsx`

Revisit these only after header menus are stable.

## Proposed Implementation

### 1. Create A Shared Header Menu Primitive

Create:

```text
components/ui/HeaderMenu.tsx
```

Suggested responsibilities:

- Wrap Expo UI `Host` and `Menu`.
- Standardize icon-only menu triggers.
- Standardize button style.
- Avoid tiny fixed hit areas.
- Keep accessibility labels explicit.
- Provide a single place to adjust native style if `glass` is unavailable or visually wrong.

Suggested API:

```tsx
type HeaderMenuProps = {
  label: string;
  systemImage?: string;
  children: React.ReactNode;
  variant?: "plain" | "glass" | "glassProminent";
};
```

Suggested implementation shape:

```tsx
import { Host, Menu } from "@expo/ui/swift-ui";
import { buttonStyle, labelStyle } from "@expo/ui/swift-ui/modifiers";

type HeaderMenuProps = {
  label: string;
  systemImage?: string;
  children: React.ReactNode;
  variant?: "plain" | "glass" | "glassProminent";
};

export default function HeaderMenu({
  label,
  systemImage = "ellipsis.circle",
  children,
  variant = "glass",
}: HeaderMenuProps) {
  return (
    <Host matchContents>
      <Menu
        label={label}
        systemImage={systemImage}
        modifiers={[labelStyle("iconOnly"), buttonStyle(variant)]}
      >
        {children}
      </Menu>
    </Host>
  );
}
```

If `buttonStyle("glass")` causes issues on the current simulator or device target, change the default to `plain` or `automatic` in one place.

### 2. Migrate `ProfileMenu`

Current file:

```text
components/profile/ProfileMenu.tsx
```

Current pattern:

- `ContextMenu`
- `ContextMenu.Trigger`
- Raw `Image systemName="ellipsis"`
- Fixed `Host` size

Target pattern:

```tsx
<HeaderMenu label={i18n.t("screen.profile.menu.title")} systemImage="ellipsis.circle">
  <Button
    onPress={handleEditBanner}
    systemImage="photo"
    label={i18n.t("screen.profile.menu.editBanner")}
  />
  <Button
    onPress={handleEditProfile}
    systemImage="square.and.pencil"
    label={i18n.t("screen.profile.menu.editProfile")}
  />
</HeaderMenu>
```

If no translation exists for a menu title, use a stable accessibility label like `"Profile actions"` first, then add translations later if needed.

### 3. Migrate `DetailsActionsMenu`

Current file:

```text
components/details/DetailsActionsMenu.tsx
```

Target trigger:

```tsx
<HeaderMenu label="More actions" systemImage="ellipsis.circle">
```

Keep existing actions:

- Copy URL: `doc.on.doc`
- Add to watchlist: `plus.square.on.square`

Do not change routing or clipboard behavior.

### 4. Migrate `FiltersMenu`

Current file:

```text
components/ui/FiltersMenu.tsx
```

Target trigger options:

- Preferred: `line.3.horizontal.decrease.circle`
- Alternative: `slider.horizontal.3`

Target pattern:

```tsx
<HeaderMenu label="Filters" systemImage="line.3.horizontal.decrease.circle">
  {/* existing Picker items */}
</HeaderMenu>
```

Keep existing picker behavior:

- Optional media type picker.
- Genre picker.
- Sort picker.
- Haptics on selection.

Potential picker style:

- Keep `pickerStyle("menu")` for compact nested menu behavior.
- Use `pickerStyle("inline")` only where expanding inline sections is desired.

### 5. Migrate `ViewHeaderMenu`

Current file:

```text
components/views/ViewHeaderMenu.tsx
```

Target trigger:

```tsx
<HeaderMenu label="View filters" systemImage="line.3.horizontal.decrease.circle">
```

Keep:

- Genre picker.
- Sort picker.
- Existing callbacks.

Remove unused theme color logic if no longer needed after raw `Image` is removed.

### 6. Migrate `WatchlistMenu`

Current file:

```text
components/watchlist/WatchlistMenu.tsx
```

Target trigger:

```tsx
<HeaderMenu label="Sort watchlists" systemImage="arrow.up.arrow.down.circle">
```

Keep:

- Sort picker.
- Existing callback.

Remove unused theme color logic if no longer needed.

### 7. Migrate `WatchlistDetailMenu`

Current file:

```text
components/watchlist/WatchlistDetailMenu.tsx
```

Target trigger:

```tsx
<HeaderMenu label="Watchlist actions" systemImage="ellipsis.circle">
```

Keep:

- Filter picker.
- Sort picker.
- Edit action for non-system watchlists.
- Delete action for non-system watchlists.
- Alert confirmation before delete.

Consider splitting the menu visually with `Section` or `Divider` later, but do not include that in the first pass unless the current SDK 56 API is already imported and verified.

## Style Decisions

### Icon Names

Use SF Symbols that naturally match iOS toolbar conventions:

- Generic actions: `ellipsis.circle`
- Filters: `line.3.horizontal.decrease.circle`
- Sort: `arrow.up.arrow.down.circle`
- Settings: `gearshape`
- Edit: `square.and.pencil`
- Delete: `trash`

### Button Style

Initial default:

```tsx
buttonStyle("glass")
```

Fallback if needed:

```tsx
buttonStyle("plain")
```

Reasoning:

- `glass` provides the native Liquid Glass look on supported OS versions.
- A single shared primitive lets us switch style globally if behavior differs on simulator/device.

### Host Layout

Prefer:

```tsx
<Host matchContents>
```

Avoid tiny fixed wrappers like:

```tsx
height: 26,
width: 20,
```

If hit testing still feels too small, add one shared wrapper style in `HeaderMenu`, not per component.

## Verification Plan

### Static Checks

Run:

```sh
PATH="/opt/homebrew/bin:$PATH" npm run typecheck
```

Search for old header menu patterns:

```sh
rg "ContextMenu\.Trigger|<ContextMenu|Image systemName=\"ellipsis\"|width: 20|height: 26" components app
```

Expected after first pass:

- No `ContextMenu` usage in header menu components.
- Card menu components may still use `ContextMenu`.

### Runtime Checks

Start Metro with compatible Node:

```sh
PATH="/opt/homebrew/bin:$PATH" npx expo start --clear
```

Check these screens on iOS simulator:

- Discover/category filters.
- Profile page actions.
- Profile views screen filters.
- Details page actions.
- Watchlist index sort menu.
- Watchlist detail filter/sort/actions menu.

For each screen verify:

- Header icon appears at consistent size.
- Single tap opens menu reliably.
- Menu has native dropdown behavior.
- Picker selections update state.
- Haptics still fire on selection/action.
- Destructive actions still show confirmation where expected.
- Light/dark mode remains readable.

## Risk Areas

### Picker Behavior Inside `Menu`

`Picker` inside `Menu` should work, but `pickerStyle("menu")` vs `pickerStyle("inline")` may need visual tuning.

Start by preserving each component's current picker style. Only adjust style after runtime testing.

### Liquid Glass Availability

`buttonStyle("glass")` is documented for iOS 26+ and tvOS 26+.

If the current simulator/device renders poorly or does not support it, change the shared `HeaderMenu` default to `plain` or `automatic`. Do not patch each menu separately.

### Header Layout

React Navigation / Expo Router header slots can be sensitive to custom native host views. If `Host matchContents` creates layout issues, use a shared style with a larger stable frame, for example `34x34` or `44x44`, in `HeaderMenu` only.

### Existing Card Menus

Do not migrate card menus in the first pass. Their `34x34` hit area is probably less problematic, and contextual menus may still be a valid pattern for row actions.

## Suggested First Commit Scope

Minimal first commit:

- Add `components/ui/HeaderMenu.tsx`.
- Migrate `ProfileMenu`.
- Migrate `DetailsActionsMenu`.
- Run typecheck.
- Test those two screens manually.

Second commit:

- Migrate `FiltersMenu`.
- Migrate `ViewHeaderMenu`.
- Migrate `WatchlistMenu`.
- Migrate `WatchlistDetailMenu`.
- Run typecheck and manual simulator checks.

Third commit if needed:

- Tune shared `HeaderMenu` style.
- Decide whether card menus should also move from `ContextMenu` to `Menu`.

## Success Criteria

- Header-right buttons have consistent icon size.
- Header-right buttons open menus on normal single tap.
- Filter/sort menus feel native and close to Apple Music toolbar menus.
- Liquid Glass styling is centralized and easy to change.
- No SDK 56 Expo Router or Expo UI warnings are introduced.
- TypeScript validation passes.
