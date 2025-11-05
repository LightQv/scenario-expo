import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  ThemeProvider,
  GenreProvider,
  UserProvider,
  ViewProvider,
  BookmarkProvider,
  useThemeContext,
} from "@/contexts";
import { Appearance } from "react-native";
import { Toasts } from "@backpackapp-io/react-native-toast";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "AbrilFatface-Regular": require("@/assets/fonts/AbrilFatface-Regular.ttf"),
    "DelaGothicOne-Regular": require("@/assets/fonts/DelaGothicOne-Regular.ttf"),
    "FiraSans-Regular": require("@/assets/fonts/FiraSans-Regular.ttf"),
    "FiraSans-Italic": require("@/assets/fonts/FiraSans-Italic.ttf"),
    "FiraSans-Thin": require("@/assets/fonts/FiraSans-Thin.ttf"),
    "FiraSans-ThinItalic": require("@/assets/fonts/FiraSans-ThinItalic.ttf"),
    "FiraSans-Light": require("@/assets/fonts/FiraSans-Light.ttf"),
    "FiraSans-LightItalic": require("@/assets/fonts/FiraSans-LightItalic.ttf"),
    "FiraSans-Medium": require("@/assets/fonts/FiraSans-Medium.ttf"),
    "FiraSans-MediumItalic": require("@/assets/fonts/FiraSans-MediumItalic.ttf"),
    "FiraSans-Bold": require("@/assets/fonts/FiraSans-Bold.ttf"),
    "FiraSans-BoldItalic": require("@/assets/fonts/FiraSans-BoldItalic.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider>
      <ThemeWrapper />
    </ThemeProvider>
  );
}

function ThemeWrapper() {
  const { isDark, themePreference } = useThemeContext();

  // Force the appearance mode when theme is manually set
  useEffect(() => {
    if (themePreference === "light") {
      Appearance.setColorScheme("light");
    } else if (themePreference === "dark") {
      Appearance.setColorScheme("dark");
    } else {
      // System - let the OS control it
      Appearance.setColorScheme(null);
    }
  }, [themePreference]);

  return (
    <UserProvider>
      <ViewProvider>
        <BookmarkProvider>
          <GenreProvider>
            <Stack>
              <Stack.Screen
                name="(modal)"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="profile"
                options={{ headerShown: false, presentation: "card" }}
              />
            </Stack>
          </GenreProvider>
        </BookmarkProvider>
      </ViewProvider>
      <Toasts overrideDarkMode={!isDark} />
    </UserProvider>
  );
}
