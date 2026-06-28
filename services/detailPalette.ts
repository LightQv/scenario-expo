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
  mood: PaletteMood;
};

type PaletteMood = "vibrant" | "muted" | "neutral";

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

type BackgroundCandidate = {
  source: string;
  background: string;
  mood: PaletteMood;
  context: PaletteContext;
};

type PaletteFamily =
  | "purpleNeon"
  | "coolShadow"
  | "warmAmber"
  | "oliveHaze"
  | "neutralDark";

type PaletteContext = {
  family: PaletteFamily;
  hasPurpleAccent: boolean;
  hasCoolAccent: boolean;
};

const detailPaletteCache = new Map<string, DetailPalette>();
const DETAIL_TEXT_COLOR = "#ffffff";
const DETAIL_BACKGROUND_MIN_CONTRAST = 3.8;
const DETAIL_PRIMARY_TEXT_MIN_CONTRAST = 6;
const DETAIL_TEXT_MIN_CONTRAST = 4.5;
const DETAIL_ACTION_MIN_CONTRAST = 3.2;

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
    mood: "neutral",
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

  const palette = createDetailPalette(result, isDark);
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
): DetailPalette {
  if (colors.platform === "ios") {
    return createIOSDetailPalette(colors, isDark);
  }

  const base = pickBaseColor(colors);
  const accent = pickAccentColor(colors, base);
  const fallback = getFallbackDetailPalette(isDark);
  const mood = getPaletteMood(colors);
  const background =
    pickReadableBackground(colors, isDark, mood) || fallback.background;
  const surface = deriveSurface(background, mood) || fallback.surface;
  const tint = deriveTint(background, mood) || fallback.tint;
  const safeAccent = deriveAccent(accent, isDark) || fallback.accent;
  const text = derivePrimaryText(background) || fallback.text;
  const secondaryText =
    deriveSecondaryText(background) || fallback.secondaryText;
  const actionBackground =
    deriveActionColor(background, safeAccent) || safeAccent;

  const palette = {
    background,
    surface,
    tint,
    accent: safeAccent,
    text,
    secondaryText,
    actionBackground,
    actionText: getReadableTextColor(actionBackground),
    pillBackground: colorWithAlpha(isDark ? "#ffffff" : "#000000", 0.38),
    mood,
  };

  return palette;
}

function createIOSDetailPalette(
  colors: Extract<ImageColorsResult, { platform: "ios" }>,
  isDark: boolean,
): DetailPalette {
  const fallback = getFallbackDetailPalette(isDark);
  const mood = getPaletteMood(colors);
  const background =
    pickReadableBackground(colors, isDark, mood) || fallback.background;
  const rawActionBackground =
    normalizeHex(colors.primary) || fallback.actionBackground;
  const surface = deriveSurface(background, mood) || fallback.surface;
  const tint = deriveTint(background, mood) || fallback.tint;
  const text = derivePrimaryText(background) || fallback.text;
  const secondaryText =
    deriveSecondaryText(background) || fallback.secondaryText;
  const safeAccent =
    deriveAccent(rawActionBackground, isDark) || fallback.accent;
  const actionBackground =
    deriveActionColor(background, safeAccent) || safeAccent;

  const palette = {
    background,
    surface,
    tint,
    accent: safeAccent,
    text,
    secondaryText,
    actionBackground,
    actionText: getReadableTextColor(actionBackground),
    pillBackground: colorWithAlpha(isDark ? "#ffffff" : "#000000", 0.38),
    mood,
  };

  return palette;
}

function pickBaseColor(colors: ImageColorsResult): string {
  if (colors.platform === "ios") {
    return (
      colors.background || colors.secondary || colors.primary || colors.detail
    );
  }

  return colors.dominant || colors.muted || colors.darkMuted || colors.vibrant;
}

function pickAccentColor(colors: ImageColorsResult, fallback: string): string {
  if (colors.platform === "ios") {
    return colors.primary || colors.detail || colors.secondary || fallback;
  }

  return colors.vibrant || colors.lightVibrant || colors.muted || fallback;
}

function pickReadableBackground(
  colors: ImageColorsResult,
  isDark: boolean,
  mood: PaletteMood,
): string | null {
  const rawCandidates = getBackgroundCandidates(colors);
  const context = getPaletteContext(rawCandidates);
  const shadowCandidates = rawCandidates.filter(isShadowSourceColor);
  const backgroundSources = shadowCandidates.length > 0 ? shadowCandidates : rawCandidates;
  const candidates = backgroundSources
    .map((color) =>
      createBackgroundCandidate(color, isDark, mood, context),
    )
    .filter((candidate): candidate is BackgroundCandidate =>
      Boolean(candidate),
    );

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((first, second) => {
    return scoreBackgroundCandidate(second) - scoreBackgroundCandidate(first);
  })[0].background;
}

function getBackgroundCandidates(colors: ImageColorsResult): string[] {
  const candidates =
    colors.platform === "ios"
      ? [colors.detail, colors.secondary, colors.background, colors.primary]
      : [
          colors.darkMuted,
          colors.darkVibrant,
          colors.muted,
          colors.dominant,
          colors.vibrant,
          colors.lightVibrant,
        ];

  return candidates.filter((color): color is string =>
    Boolean(normalizeHex(color)),
  );
}

function getPaletteContext(colors: string[]): PaletteContext {
  const hsls = colors
    .map((color) => hexToHsl(color))
    .filter((hsl): hsl is Hsl => Boolean(hsl));

  if (hsls.length === 0) {
    return {
      family: "neutralDark",
      hasPurpleAccent: false,
      hasCoolAccent: false,
    };
  }

  const purpleColors = hsls.filter(isPurpleNeon);
  const coolColors = hsls.filter(isCoolShadow);
  const warmColors = hsls.filter(isWarmAmber);
  const oliveColors = hsls.filter(isOliveWash);
  const darkNeutralColors = hsls.filter(
    (hsl) => hsl.l <= 0.28 && hsl.s < 0.12,
  );
  const hasPurpleAccent = purpleColors.length > 0;
  const hasCoolAccent = coolColors.length > 0;
  let family: PaletteFamily = "coolShadow";

  if (purpleColors.length > 0 && getFamilyWeight(purpleColors) >= 0.42) {
    family = "purpleNeon";
  } else if (
    coolColors.length > 0 &&
    getFamilyWeight(coolColors) >= getFamilyWeight(oliveColors) * 0.78
  ) {
    family = "coolShadow";
  } else if (
    warmColors.length > 0 &&
    getFamilyWeight(warmColors) > getFamilyWeight(coolColors) * 1.2
  ) {
    family = "warmAmber";
  } else if (
    oliveColors.length > 0 &&
    coolColors.length === 0 &&
    purpleColors.length === 0
  ) {
    family = "oliveHaze";
  } else if (darkNeutralColors.length > 0) {
    family = "neutralDark";
  }

  return {
    family,
    hasPurpleAccent,
    hasCoolAccent,
  };
}

function getFamilyWeight(hsls: Hsl[]): number {
  return hsls.reduce((total, hsl) => {
    const depth = 1 - clamp(hsl.l, 0, 0.72) / 0.72;

    return total + hsl.s * 0.72 + depth * 0.28;
  }, 0);
}

function getPaletteMood(colors: ImageColorsResult): PaletteMood {
  const hsls = getBackgroundCandidates(colors)
    .map((color) => hexToHsl(color))
    .filter((hsl): hsl is Hsl => Boolean(hsl));

  if (hsls.length === 0) {
    return "neutral";
  }

  const colorfulColors = hsls.filter(
    (hsl) => hsl.s >= 0.28 && hsl.l >= 0.12 && hsl.l <= 0.72,
  );
  const meaningfulColors = hsls.filter(
    (hsl) => hsl.s >= 0.16 && hsl.l >= 0.1 && hsl.l <= 0.78,
  );
  const darkCinematicColors = hsls.filter(
    (hsl) => hsl.s >= 0.12 && hsl.l >= 0.08 && hsl.l <= 0.34,
  );
  const skinToneColors = hsls.filter(isSkinToneLike);
  const averageSaturation =
    hsls.reduce((total, hsl) => total + hsl.s, 0) / hsls.length;
  const hasHueContrast = hasMeaningfulHueContrast(colorfulColors);

  if (
    colorfulColors.length >= 2 &&
    hasHueContrast &&
    skinToneColors.length < colorfulColors.length
  ) {
    return "vibrant";
  }

  if (
    colorfulColors.length >= 1 &&
    averageSaturation >= 0.22 &&
    skinToneColors.length <= Math.floor(hsls.length / 2)
  ) {
    return "muted";
  }

  if (meaningfulColors.length >= 2 && averageSaturation >= 0.16) {
    return "muted";
  }

  if (darkCinematicColors.length >= 1 && averageSaturation >= 0.12) {
    return "muted";
  }

  return "neutral";
}

function hasMeaningfulHueContrast(hsls: Hsl[]): boolean {
  for (let firstIndex = 0; firstIndex < hsls.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < hsls.length;
      secondIndex += 1
    ) {
      if (getHueDistance(hsls[firstIndex].h, hsls[secondIndex].h) >= 0.12) {
        return true;
      }
    }
  }

  return false;
}

function createBackgroundCandidate(
  color: string,
  isDark: boolean,
  mood: PaletteMood,
  context: PaletteContext,
): BackgroundCandidate | null {
  const background = deriveBackground(color, isDark, mood, context);

  if (!background) {
    return null;
  }

  return {
    source: color,
    background,
    mood,
    context,
  };
}

function scoreBackgroundCandidate(candidate: BackgroundCandidate): number {
  const hsl = hexToHsl(candidate.background);
  const sourceHsl = hexToHsl(candidate.source);

  if (!hsl || !sourceHsl) {
    return Number.NEGATIVE_INFINITY;
  }

  const contrast = getContrastRatio(DETAIL_TEXT_COLOR, candidate.background);
  const contrastScore =
    clamp(contrast / DETAIL_BACKGROUND_MIN_CONTRAST, 0, 1.35) * 34;
  const targetSaturation = getTargetBackgroundSaturation(candidate.mood);
  const targetLightness = getTargetBackgroundLightness(candidate.mood);
  const lightnessScore = (1 - Math.abs(hsl.l - targetLightness) / 0.16) * 38;
  const saturationScore =
    (1 - Math.abs(hsl.s - targetSaturation) / 0.24) * 22;
  const darkSourceBonus = sourceHsl.l < 0.24 ? 18 : sourceHsl.l < 0.34 ? 8 : 0;
  const deepBackgroundBonus = hsl.l < 0.19 ? 16 : hsl.l < 0.24 ? 8 : 0;
  const neutralBonus = sourceHsl.s < 0.08 && sourceHsl.l < 0.26 ? 10 : 0;
  const weakColorPenalty = sourceHsl.s < 0.08 && hsl.s > 0.08 ? 20 : 0;
  const grayPenalty = hsl.s < 0.025 && hsl.l > 0.18 ? 8 : 0;
  const vividBackgroundPenalty =
    candidate.mood === "neutral" && hsl.s > 0.24 ? 18 : 0;
  const neonPenalty = hsl.s > 0.56 && hsl.l > 0.26 ? 18 : 0;
  const washedPenalty = hsl.l > 0.24 && hsl.s < 0.2 ? 24 : 0;
  const oliveWashPenalty = isOliveWash(hsl) ? 26 : 0;
  const familyScore = getPaletteFamilyScore(candidate.context, hsl, sourceHsl);
  const lightSourcePenalty = isBrightLightSource(sourceHsl) ? 34 : 0;
  const skinTonePenalty =
    isSkinToneLike(sourceHsl) && sourceHsl.l > 0.24 ? 18 : 0;

  return (
    contrastScore +
    lightnessScore +
    saturationScore +
    darkSourceBonus +
    deepBackgroundBonus +
    familyScore +
    neutralBonus -
    weakColorPenalty -
    grayPenalty -
    vividBackgroundPenalty -
    neonPenalty -
    washedPenalty -
    oliveWashPenalty -
    lightSourcePenalty -
    skinTonePenalty
  );
}

function getPaletteFamilyScore(
  context: PaletteContext,
  hsl: Hsl,
  sourceHsl: Hsl,
): number {
  const sourceOrBackground = [hsl, sourceHsl];
  const { family } = context;

  if (family === "purpleNeon" || context.hasPurpleAccent) {
    return sourceOrBackground.some(isPurpleNeon)
      ? 38
      : sourceOrBackground.some(isIndigoShadow)
        ? 28
        : sourceOrBackground.some(isCoolShadow)
          ? 4
          : isOliveWash(hsl)
            ? -46
            : 0;
  }

  if (family === "coolShadow") {
    return sourceOrBackground.some(isCoolShadow)
      ? 34
      : isOliveWash(hsl)
        ? -34
        : sourceOrBackground.some(isPurpleNeon)
          ? 10
          : 0;
  }

  if (family === "warmAmber") {
    return sourceOrBackground.some(isWarmAmber)
      ? 30
      : sourceOrBackground.some(isCoolShadow)
        ? 6
        : isOliveWash(hsl)
          ? -16
          : 0;
  }

  if (family === "oliveHaze") {
    return isOliveWash(hsl) ? 8 : 0;
  }

  return hsl.l <= 0.22 && hsl.s < 0.18 ? 18 : 0;
}

function deriveBackground(
  color: string,
  isDark: boolean,
  mood: PaletteMood,
  context: PaletteContext,
): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  const saturationBounds = getBackgroundSaturationBounds(hsl, mood);
  const lightnessBounds = getBackgroundLightnessBounds(isDark, mood);
  const targetLightness = getTargetBackgroundLightness(mood);
  const sourceLikeLightness = clamp(
    Math.min(hsl.l * 0.72, targetLightness + 0.025),
    lightnessBounds.min,
    lightnessBounds.max,
  );
  const gradedHsl = gradeShadowHue(hsl, context);
  const sourceLike = hslToHex({
    h: gradedHsl.h,
    s: clamp(
      gradedHsl.s * getBackgroundSaturationScale(mood),
      saturationBounds.min,
      saturationBounds.max,
    ),
    l: sourceLikeLightness,
  });

  if (
    getContrastRatio(DETAIL_TEXT_COLOR, sourceLike) >=
    DETAIL_BACKGROUND_MIN_CONTRAST
  ) {
    return sourceLike;
  }

  const softened = hslToHex({
    h: gradedHsl.h,
    s: clamp(gradedHsl.s * 0.9, saturationBounds.min, saturationBounds.max),
    l: clamp(
      sourceLikeLightness - 0.025,
      lightnessBounds.min,
      lightnessBounds.max,
    ),
  });

  return ensureReadableBackground(softened) || sourceLike;
}

function getBackgroundSaturationBounds(
  hsl: Hsl,
  mood: PaletteMood,
): { min: number; max: number } {
  if (hsl.s < 0.08) {
    return { min: 0, max: 0.025 };
  }

  if (isSkinToneLike(hsl)) {
    return { min: 0.035, max: 0.14 };
  }

  if (mood === "vibrant") {
    return { min: 0.24, max: 0.64 };
  }

  if (mood === "muted") {
    return { min: 0.12, max: 0.36 };
  }

  return { min: 0.055, max: 0.22 };
}

function getBackgroundLightnessBounds(
  isDark: boolean,
  mood: PaletteMood,
): { min: number; max: number } {
  if (mood === "vibrant") {
    return { min: isDark ? 0.085 : 0.1, max: isDark ? 0.24 : 0.26 };
  }

  if (mood === "muted") {
    return { min: isDark ? 0.085 : 0.1, max: isDark ? 0.235 : 0.255 };
  }

  return { min: isDark ? 0.08 : 0.095, max: isDark ? 0.22 : 0.24 };
}

function getBackgroundSaturationScale(mood: PaletteMood): number {
  if (mood === "vibrant") {
    return 1.14;
  }

  if (mood === "muted") {
    return 1.04;
  }

  return 0.92;
}

function getTargetBackgroundSaturation(mood: PaletteMood): number {
  if (mood === "vibrant") {
    return 0.48;
  }

  if (mood === "muted") {
    return 0.26;
  }

  return 0.16;
}

function getTargetBackgroundLightness(mood: PaletteMood): number {
  if (mood === "vibrant") {
    return 0.155;
  }

  if (mood === "muted") {
    return 0.15;
  }

  return 0.135;
}

function isSkinToneLike(hsl: Hsl): boolean {
  return hsl.h >= 0.035 && hsl.h <= 0.13 && hsl.s >= 0.14 && hsl.l >= 0.22;
}

function isOliveWash(hsl: Hsl): boolean {
  return (
    hsl.h >= 0.12 &&
    hsl.h <= 0.22 &&
    hsl.s >= 0.1 &&
    hsl.s <= 0.34 &&
    hsl.l > 0.16
  );
}

function isShadowSourceColor(color: string): boolean {
  const hsl = hexToHsl(color);

  if (!hsl || isSkinToneLike(hsl) || isBrightLightSource(hsl)) {
    return false;
  }

  if (isPurpleNeon(hsl)) {
    return hsl.l <= 0.46;
  }

  return hsl.l <= 0.38;
}

function isBrightLightSource(hsl: Hsl): boolean {
  return hsl.s >= 0.24 && hsl.l >= 0.42;
}

function isPurpleNeon(hsl: Hsl): boolean {
  return (
    ((hsl.h >= 0.68 && hsl.h <= 0.88) || hsl.h >= 0.92 || hsl.h <= 0.02) &&
    hsl.s >= 0.24 &&
    hsl.l >= 0.08 &&
    hsl.l <= 0.56
  );
}

function isCoolShadow(hsl: Hsl): boolean {
  return hsl.h >= 0.45 && hsl.h <= 0.68 && hsl.s >= 0.06 && hsl.l <= 0.34;
}

function isIndigoShadow(hsl: Hsl): boolean {
  return hsl.h >= 0.58 && hsl.h <= 0.78 && hsl.s >= 0.08 && hsl.l <= 0.36;
}

function isWarmAmber(hsl: Hsl): boolean {
  return hsl.h >= 0.03 && hsl.h <= 0.12 && hsl.s >= 0.12 && hsl.l <= 0.48;
}

function gradeShadowHue(hsl: Hsl, context: PaletteContext): Hsl {
  if (context.hasPurpleAccent && isCoolShadow(hsl)) {
    return {
      h: blendHue(hsl.h, 0.72, 0.48),
      s: clamp(Math.max(hsl.s, 0.18), 0.18, 0.42),
      l: hsl.l,
    };
  }

  if (!context.hasPurpleAccent && context.hasCoolAccent && isOliveWash(hsl)) {
    return {
      h: blendHue(hsl.h, 0.56, 0.42),
      s: clamp(hsl.s * 0.9, 0.1, 0.24),
      l: hsl.l,
    };
  }

  return hsl;
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
      l: clamp(candidateHsl.l - 0.025, 0.08, 1),
    };
    candidate = hslToHex(candidateHsl);
  }

  return getContrastRatio(DETAIL_TEXT_COLOR, candidate) >=
    DETAIL_BACKGROUND_MIN_CONTRAST
    ? candidate
    : null;
}

function deriveSurface(color: string, mood: PaletteMood): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  const maxSaturation = mood === "vibrant" ? 0.54 : mood === "muted" ? 0.34 : 0.22;
  const lightnessBoost = mood === "vibrant" ? 0.035 : mood === "muted" ? 0.035 : 0.03;

  return hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.95, 0.035, maxSaturation),
    l: clamp(hsl.l + lightnessBoost, 0.12, mood === "vibrant" ? 0.3 : 0.28),
  });
}

function deriveTint(color: string, mood: PaletteMood): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  const minSaturation = mood === "vibrant" ? 0.18 : mood === "muted" ? 0.12 : 0.06;
  const maxSaturation = mood === "vibrant" ? 0.76 : mood === "muted" ? 0.44 : 0.28;
  const lightnessBoost = mood === "vibrant" ? 0.07 : mood === "muted" ? 0.065 : 0.055;

  return hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 1.08, minSaturation, maxSaturation),
    l: clamp(hsl.l + lightnessBoost, 0.16, mood === "vibrant" ? 0.36 : 0.32),
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
    l: isDark
      ? clamp(hsl.l + 0.16, 0.48, 0.68)
      : clamp(hsl.l - 0.1, 0.34, 0.52),
  });
}

function deriveActionColor(background: string, accent: string): string | null {
  const backgroundHsl = hexToHsl(background);
  const accentHsl = hexToHsl(accent);

  if (!backgroundHsl || !accentHsl) {
    return null;
  }

  const hueDistance = getHueDistance(backgroundHsl.h, accentHsl.h);
  const hue =
    hueDistance < 0.18
      ? blendHue(backgroundHsl.h, accentHsl.h, 0.35)
      : backgroundHsl.h;
  const candidate = hslToHex({
    h: hue,
    s: clamp(Math.max(backgroundHsl.s, accentHsl.s) * 1.08, 0.24, 0.58),
    l: clamp(backgroundHsl.l + 0.38, 0.56, 0.74),
  });

  return ensureActionContrast(candidate, background);
}

function ensureActionContrast(
  color: string,
  background: string,
): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  let candidate = color;
  let candidateHsl = hsl;

  for (let index = 0; index < 8; index += 1) {
    if (getContrastRatio(candidate, background) >= DETAIL_ACTION_MIN_CONTRAST) {
      return candidate;
    }

    candidateHsl = {
      ...candidateHsl,
      s: clamp(candidateHsl.s + 0.03, 0, 0.68),
      l: clamp(candidateHsl.l + 0.035, 0, 0.84),
    };
    candidate = hslToHex(candidateHsl);
  }

  return getContrastRatio(candidate, background) >= DETAIL_ACTION_MIN_CONTRAST
    ? candidate
    : null;
}

function derivePrimaryText(background: string): string | null {
  const hsl = hexToHsl(background);

  if (!hsl) {
    return null;
  }

  const candidate = hslToHex({
    h: hsl.h,
    s: clamp(hsl.s * 0.18, 0.02, 0.07),
    l: 0.94,
  });

  return ensurePrimaryTextContrast(candidate, background);
}

function ensurePrimaryTextContrast(
  color: string,
  background: string,
): string | null {
  const hsl = hexToHsl(color);

  if (!hsl) {
    return null;
  }

  let candidate = color;
  let candidateHsl = hsl;

  for (let index = 0; index < 6; index += 1) {
    if (
      getContrastRatio(candidate, background) >=
      DETAIL_PRIMARY_TEXT_MIN_CONTRAST
    ) {
      return candidate;
    }

    candidateHsl = {
      ...candidateHsl,
      s: clamp(candidateHsl.s - 0.01, 0, 1),
      l: clamp(candidateHsl.l + 0.01, 0, 1),
    };
    candidate = hslToHex(candidateHsl);
  }

  return getContrastRatio(DETAIL_TEXT_COLOR, background) >=
    DETAIL_PRIMARY_TEXT_MIN_CONTRAST
    ? DETAIL_TEXT_COLOR
    : null;
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

function getHueDistance(first: number, second: number): number {
  const distance = Math.abs(first - second);

  return Math.min(distance, 1 - distance);
}

function blendHue(first: number, second: number, amount: number): number {
  let delta = second - first;

  if (delta > 0.5) {
    delta -= 1;
  }

  if (delta < -0.5) {
    delta += 1;
  }

  const blended = first + delta * amount;

  return (blended + 1) % 1;
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

    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
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
