import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import {
  THEME_COLORS,
  GRADE_COLORS,
  TOAST_COLORS,
} from "@/constants/theme/colors";

interface ThemeContextProps {
  isDark: boolean;
  colors: {
    main: string;
    accent: string;
    grade: typeof GRADE_COLORS.light;
    toast: typeof TOAST_COLORS.light;
  };
}

const ThemeContext = createContext<ThemeContextProps>({
  isDark: false,
  colors: {
    main: THEME_COLORS.main,
    accent: THEME_COLORS.accent,
    grade: GRADE_COLORS.light,
    toast: TOAST_COLORS.light,
  },
});

export const useThemeContext = () => {
  return useContext(ThemeContext);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeContextValue: ThemeContextProps = {
    isDark,
    colors: {
      main: isDark ? THEME_COLORS.accent : THEME_COLORS.main,
      accent: isDark ? THEME_COLORS.main : THEME_COLORS.accent,
      grade: isDark ? GRADE_COLORS.dark : GRADE_COLORS.light,
      toast: isDark ? TOAST_COLORS.dark : TOAST_COLORS.light,
    },
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
