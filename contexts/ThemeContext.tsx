import { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  THEME_COLORS,
  GRADE_COLORS,
  TOAST_COLORS,
  ADAPTIVE_COLORS,
} from "@/constants/theme/colors";

type ThemePreference = "light" | "dark" | "system";

interface ThemeContextProps {
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
  colors: {
    main: string;
    accent: string;
    text: string;
    background: string;
    headerBackground: string;
    grade: typeof GRADE_COLORS.light;
    toast: typeof TOAST_COLORS.light;
    error: string;
  };
  customColors: {
    light: string;
    dark: string;
  };
  setCustomColor: (mode: "light" | "dark", color: string) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const STORAGE_KEYS = {
  THEME: "app_theme",
  COLOR_LIGHT: "app_color_light",
  COLOR_DARK: "app_color_dark",
};

const DEFAULT_COLORS = {
  light: THEME_COLORS.main,
  dark: THEME_COLORS.accent,
};

const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  themePreference: "system",
  setThemePreference: async () => {},
  colors: {
    main: THEME_COLORS.main,
    accent: THEME_COLORS.accent,
    text: ADAPTIVE_COLORS.light.text,
    background: ADAPTIVE_COLORS.light.background,
    headerBackground: ADAPTIVE_COLORS.light.headerBackground,
    grade: GRADE_COLORS.light,
    toast: TOAST_COLORS.light,
    error: THEME_COLORS.error,
  },
  customColors: DEFAULT_COLORS,
  setCustomColor: async () => {},
  resetSettings: async () => {},
});

export const useThemeContext = () => {
  return useContext(ThemeContext);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [customColors, setCustomColorsState] = useState(DEFAULT_COLORS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from secure store on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync(STORAGE_KEYS.THEME);
        const savedLightColor = await SecureStore.getItemAsync(
          STORAGE_KEYS.COLOR_LIGHT
        );
        const savedDarkColor = await SecureStore.getItemAsync(
          STORAGE_KEYS.COLOR_DARK
        );

        if (savedTheme) {
          setThemePreferenceState(savedTheme as ThemePreference);
        }

        setCustomColorsState({
          light: savedLightColor || DEFAULT_COLORS.light,
          dark: savedDarkColor || DEFAULT_COLORS.dark,
        });
      } catch (error) {
        console.error("Error loading theme settings:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME, preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const setCustomColor = async (mode: "light" | "dark", color: string) => {
    try {
      const key =
        mode === "light" ? STORAGE_KEYS.COLOR_LIGHT : STORAGE_KEYS.COLOR_DARK;
      await SecureStore.setItemAsync(key, color);
      setCustomColorsState((prev) => ({ ...prev, [mode]: color }));
    } catch (error) {
      console.error("Error saving custom color:", error);
    }
  };

  const resetSettings = async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.THEME);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.COLOR_LIGHT);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.COLOR_DARK);
      setThemePreferenceState("system");
      setCustomColorsState(DEFAULT_COLORS);
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  };

  // Determine actual dark mode based on preference
  const isDark =
    themePreference === "system"
      ? systemColorScheme === "dark"
      : themePreference === "dark";

  // Use custom colors if available, otherwise use defaults
  const mainColor = isDark ? customColors.dark : customColors.light;
  const accentColor = isDark ? customColors.light : customColors.dark;

  const themeContextValue: ThemeContextProps = {
    isDark,
    themePreference,
    setThemePreference,
    customColors,
    setCustomColor,
    resetSettings,
    colors: {
      main: mainColor,
      accent: accentColor,
      text: isDark ? ADAPTIVE_COLORS.dark.text : ADAPTIVE_COLORS.light.text,
      background: isDark
        ? ADAPTIVE_COLORS.dark.background
        : ADAPTIVE_COLORS.light.background,
      headerBackground: isDark
        ? ADAPTIVE_COLORS.dark.headerBackground
        : ADAPTIVE_COLORS.light.headerBackground,
      grade: isDark ? GRADE_COLORS.dark : GRADE_COLORS.light,
      toast: isDark ? TOAST_COLORS.dark : TOAST_COLORS.light,
      error: isDark ? THEME_COLORS.errorAccent : THEME_COLORS.error,
    },
  };

  // Don't render until settings are loaded to prevent flashing
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
