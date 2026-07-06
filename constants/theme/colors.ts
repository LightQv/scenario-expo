export const THEME_COLORS = {
  main: "#eab208",
  accent: "#f9cd4a",
  error: "#ef4444",
  errorAccent: "#f47c7c",
};

export const ADAPTIVE_COLORS = {
  light: {
    text: "#000",
    background: "#fff",
    headerBackground: "#fff",
  },
  dark: {
    text: "#fff",
    background: "#1C1C1E",
    headerBackground: "#1C1C1E",
  },
};

export const GRADE_COLORS = {
  light: {
    excellent: "#549c47",
    good: "#adc178",
    average: "#eab208",
    bad: "#ef4444",
  },
  dark: {
    excellent: "#82c177",
    good: "#c6d4a1",
    average: "#f9cd4a",
    bad: "#f47c7c",
  },
};

export const TOAST_COLORS = {
  light: {
    success: "#549c47",
    warning: "#fb8b24",
    error: "#ef4444",
    info: "#3b82f6",
  },
  dark: {
    success: "#82c177",
    warning: "#fcae66",
    error: "#f47c7c",
    info: "#60a5fa",
  },
};

export const BADGE_COLORS = {
  bronze: {
    background: ["#9A5A2E", "#D8A15F"],
    progress: "#D8A15F",
  },
  silver: {
    background: ["#6E7581", "#D7DCE2"],
    progress: "#B8C0CA",
  },
  gold: {
    background: ["#B67A00", "#F9CD4A"],
    progress: "#F9CD4A",
  },
  platinum: {
    background: ["#36556F", "#8EC5D9"],
    progress: "#8EC5D9",
  },
  locked: {
    background: ["#6B7280", "#A1A1AA"],
    progress: "#8E8E93",
  },
} as const;
