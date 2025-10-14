export type ColorTheme = {
  background: {
    primary: string;
    secondary: string;
    third: string;
    quad: string;
    alt: string;
  };
  color: {
    primary: string;
    secondary: string;
    alt: string;
    gray: string;
    main: string;
    second: string;
  };
  grade: Record<"excellent" | "good" | "average" | "bad", string>;
  toast: Record<"success" | "warning" | "error" | "promise", string>;
};

export const LIGHT: ColorTheme = {
  background: {
    primary: "#FFFFFF",
    secondary: "#F7F7F7",
    third: "#E5E7EB",
    quad: "#D1D5DB",
    alt: "#F7F7F7",
  },
  color: {
    primary: "#000000",
    secondary: "#FFFFFF",
    alt: "#000000",
    gray: "#D1D5DB",
    main: "#eab208",
    second: "#EA0B17",
  },
  grade: {
    excellent: "#549c47",
    good: "#adc178",
    average: "#eab208",
    bad: "#ef4444",
  },
  toast: {
    success: "#549c47",
    warning: "#fb8b24",
    error: "#ef4444",
    promise: "#eab208",
  },
};

export const DARK: ColorTheme = {
  background: {
    primary: "#121212",
    secondary: "#16181C",
    third: "#1D1F23",
    quad: "#5a606c",
    alt: "#1D1F23",
  },
  color: {
    primary: "#E7E9EA",
    secondary: "#71767B",
    alt: "#71767B",
    gray: "#71767B",
    main: "#f9cd4a",
    second: "#c92c35",
  },
  grade: {
    excellent: "#82c177",
    good: "#c6d4a1",
    average: "#f9cd4a",
    bad: "#f47c7c",
  },
  toast: {
    success: "#82c177",
    warning: "#fcae66",
    error: "#f47c7c",
    promise: "#f9cd4a",
  },
};
