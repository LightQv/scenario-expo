import { getColors, type ImageColorsResult } from "react-native-image-colors";

export type DetailPalette = {
  background: string;
  surface: string;
  tint: string;
  accent: string;
  text: string;
  secondaryText: string;
  actionBackground: string;
  actionText: string;
  pillBackground: string;
};

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Hsl = {
  h: number;
  s: number;
  l: number;
};

const detailPaletteCache = new Map<string, DetailPalette>();
const DETAIL_TEXT_COLOR = "#ffffff";
const DETAIL_BACKGROUND_MIN_CONTRAST = 3.8;
const DETAIL_TEXT_MIN_CONTRAST = 4.5;

export function getFallbackDetailPalette(isDark: boolean): DetailPalette {
  const background = isDark ? "#171719" : "#f7f3ed";
  const surface = isDark ? "#232326" : "#fffaf2";
  const tint = isDark ? "#2b2b30" : "#efe3d2";

  return {
    background,
    surface,
    tint,
    accent: isDark ? "#f9cd4a" : "#eab208",
    text: DETAIL_TEXT_COLOR,
    secondaryText: isDark ? "#c9c9ce" : "#6f6f78",
    actionBackground: isDark ? "#f9cd4a" : "#eab208",
    actionText: "#000000",
    pillBackground: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.45)",
  };
}

export async function getDetailPaletteFromImage(
  imageUrl: string,
  isDark: boolean,
): Promise<DetailPalette> {
  const cacheKey = `${isDark ? "dark" : "light"}:${imageUrl}`;
  const cachedPalette = detailPaletteCache.get(cacheKey);

  if (cachedPalette) {
    return cachedPalette;
  }

  const result = await getColors(imageUrl, {
    cache: true,
    fallback: isDark ? "#171719" : "#f7f3ed",
    key: imageUrl,
    quality: "low",
  });
  if (__DEV__) {
    console.log("[DetailPalette] raw image colors", {
      imageUrl,
      result,
    });
  }

  const palette = createDetailPalette(result, isDark, imageUrl);
  detailPaletteCache.set(cacheKey, palette);

  return palette;
}

export function colorWithAlpha(color: string, alpha: number): string {
  const rgb = hexToRgb(color);

  if (!rgb) {
    return color;
  }

  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function createDetailPalette(
  colors: ImageColorsResult,
  isDark: boolean,
  imageUrl?: string,
): DetailPalette {
  if (colors.platform === "ios") {
    return createIOSDetailPalette(colors, isDark, imageUrl);
  }

  const base = pickBaseColor(colors);
  const accent = pickAccentColor(colors, base);
  const fallback = getFallbackDetailPalette(isDark);
  const background = deriveBackground(base, isDark) || fallback.background;
  const surface = deriveSurface(background, isDark) || fallback.surface;
  const tint = deriveTint(base, isDark) || fallback.tint;
  const safeAccent = deriveAccent(accent, isDark) || fallback.accent;
  const secondaryText = deriveSecondaryText(background) || fallback.secondaryText;

  const palette = {
    background,
    surface,
    tint,
    accent: safeAccent,
    text: fallback.text,
    secondaryText,
    actionBackground: safeAccent,
    actionText: getReadableTextColor(safeAccent),
    pillBackground: colorWithAlpha(isDark ? "#ffffff" : "#000000", 0.38),
  };

  if (__DEV__) {
    console.log("[DetailPalette] derived palette", {
      imageUrl,
      platform: colors.platform,
      selected: {
        base,
        accent,
      },
      palette,
    });
  }

  return palette;
}

function createIOSDetailPalette(
  colors: Extract<ImageColorsResult, { platform: "ios" }>,
  isDark: boolean,
  imageUrl?: string,
): DetailPalette {
  const fallback = getFallbackDetailPalette(isDark);
  const background = deriveBackground(colors.background, isDark) || fallback.background;
  const actionBackground = normalizeHex(colors.primary) || fallback.actionBackground;
  const tint = deriveTint(colors.secondary || background, isDark) || fallback.tint;
  const secondaryText = deriveSecondaryText(background) || fallback.secondaryText;

  const palette = {
    background,
    surface: deriveSurface(background, isDark) || fallback.surface,
    tint,
    accent: deriveAccent(actionBackground, isDark) || fallback.accent,
    text: fallback.text,
    secondaryText,
    actionBackground,
    actionText: getReadableTextColor(actionBackground),
    pillBackground: colorWithAlpha(isDark ? "#ffffff" : "#000000", 0.38),
  };

  if (__DEV__) {
    console.log("[DetailPalette] derived palette", {
      imageUrl,
      platform: colors.platform,
      selected: {
        background: colors.background,
        actionBackground: colors.primary,
        secondaryTextSource: "background",
      },
      palette,
    });
  }

  return palette;
}

function pickBaseColor(colors: ImageColorsResult): string {
  if (colors.platform === "ios") {
    return colors.background || colors.secondary || colors.primary || colors.detail;
  }

  return colors.dominant || colors.muted || colors.darkMuted || colors.vibrant;
}

function pickAccentColor(colors: ImageColorsResult, fallback: string): string {
  if (colors.platform === "ios") {
    return colors.primary || colors.detail || colors.secondary || fallback;
  }

  return colors.vibrant || colors.lightVibrant || colors.muted || fallback;
}

function deriveBackground(color: string, isDark: boolean): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  const sourceLike = hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.9, 0.08, isDark ? 0.44 : 0.4),
    l: clamp(hsl.l, isDark ? 0.14 : 0.16, isDark ? 0.34 : 0.36),
  });

  if (
    getContrastRatio(DETAIL_TEXT_COLOR, sourceLike) >=
    DETAIL_BACKGROUND_MIN_CONTRAST
  ) {
    return sourceLike;
  }

  const softened = hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.75, 0.08, isDark ? 0.38 : 0.34),
    l: clamp(hsl.l, isDark ? 0.14 : 0.16, isDark ? 0.34 : 0.36),
  });

  return ensureReadableBackground(softened) || sourceLike;
}

function ensureReadableBackground(background: string): string | null {
  const hsl = hexToHsl(background);

  if (!hsl) {
    return null;
  }

  let candidate = background;
  let candidateHsl = hsl;

  for (let index = 0; index < 12; index += 1) {
    if (
      getContrastRatio(DETAIL_TEXT_COLOR, candidate) >=
      DETAIL_BACKGROUND_MIN_CONTRAST
    ) {
      return candidate;
    }

    candidateHsl = {
      ...candidateHsl,
      l: clamp(candidateHsl.l - 0.025, 0.14, 1),
    };
    candidate = hslToHex(candidateHsl);
  }

  return getContrastRatio(DETAIL_TEXT_COLOR, candidate) >=
    DETAIL_BACKGROUND_MIN_CONTRAST
    ? candidate
    : null;
}

function deriveSurface(color: string, isDark: boolean): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  return hslToHex({
    h: hsl.h,
    s: hsl.s,
    l: isDark ? clamp(hsl.l + 0.05, 0.16, 0.26) : clamp(hsl.l + 0.04, 0.92, 0.98),
  });
}

function deriveTint(color: string, isDark: boolean): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  return hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.7, 0.12, 0.42),
    l: isDark ? clamp(hsl.l * 0.48, 0.18, 0.3) : clamp(0.78 + hsl.l * 0.08, 0.76, 0.88),
  });
}

function deriveAccent(color: string, isDark: boolean): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  return hslToHex({
    h: hsl.h,
    s: clamp(hsl.s, 0.28, 0.62),
    l: isDark ? clamp(hsl.l + 0.16, 0.48, 0.68) : clamp(hsl.l - 0.1, 0.34, 0.52),
  });
}

function deriveSecondaryText(background: string): string | null {
  const hsl = hexToHsl(background);
  const backgroundRgb = hexToRgb(background);

  if (!hsl || !backgroundRgb) {
    return null;
  }

  const backgroundLuminance = getRelativeLuminance(backgroundRgb);
  const shouldDarken = backgroundLuminance > 0.5;
  const targetLightness = shouldDarken
    ? clamp(hsl.l - 0.38, 0.24, 0.46)
    : clamp(hsl.l + 0.44, 0.58, 0.76);
  const candidate = hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.85, 0.1, 0.34),
    l: targetLightness,
  });

  return ensureContrast(candidate, background, shouldDarken);
}

function ensureContrast(
  color: string,
  background: string,
  darken: boolean,
): string | null {
  const colorHsl = hexToHsl(color);

  if (!colorHsl) {
    return null;
  }

  let candidate = color;
  let candidateHsl = colorHsl;

  for (let index = 0; index < 12; index += 1) {
    if (getContrastRatio(candidate, background) >= DETAIL_TEXT_MIN_CONTRAST) {
      return candidate;
    }

    candidateHsl = {
      ...candidateHsl,
      l: darken
        ? clamp(candidateHsl.l - 0.04, 0.12, 1)
        : clamp(candidateHsl.l + 0.04, 0, 0.9),
    };
    candidate = hslToHex(candidateHsl);
  }

  return getContrastRatio(candidate, background) >= DETAIL_TEXT_MIN_CONTRAST
    ? candidate
    : null;
}

function hexToHsl(hex: string): Hsl | null {
  const rgb = hexToRgb(hex);

  if (!rgb) {
    return null;
  }

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }

    h /= 6;
  }

  return { h, s, l };
}

function hslToHex({ h, s, l }: Hsl): string {
  const hueToRgb = (p: number, q: number, tValue: number) => {
    let t = tValue;

    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

    return p;
  };

  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return rgbToHex({
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  });
}

function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return null;
  }

  const int = Number.parseInt(value, 16);

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function normalizeHex(color: string | undefined): string | null {
  if (!color) {
    return null;
  }

  const rgb = hexToRgb(color);

  if (!rgb) {
    return null;
  }

  return rgbToHex(rgb);
}

function getReadableTextColor(background: string): string {
  const rgb = hexToRgb(background);

  if (!rgb) {
    return "#000000";
  }

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.62 ? "#000000" : "#ffffff";
}

function getContrastRatio(foreground: string, background: string): number {
  const foregroundRgb = hexToRgb(foreground);
  const backgroundRgb = hexToRgb(background);

  if (!foregroundRgb || !backgroundRgb) {
    return 0;
  }

  const foregroundLuminance = getRelativeLuminance(foregroundRgb);
  const backgroundLuminance = getRelativeLuminance(backgroundRgb);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance({ r, g, b }: Rgb): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;

    return value <= 0.03928
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
