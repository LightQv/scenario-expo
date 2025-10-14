import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { LIGHT, DARK, type ColorTheme } from "./colors";

const ThemeContext = createContext<ColorTheme>(LIGHT);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DARK : LIGHT;
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
