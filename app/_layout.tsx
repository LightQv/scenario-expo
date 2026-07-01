import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import "react-native-reanimated";
import {
  ThemeProvider,
  GenreProvider,
  UserProvider,
  ViewProvider,
  BookmarkProvider,
  OwnedMediaProvider,
  DownloadRequestProvider,
  useThemeContext,
} from "@/contexts";
import { Appearance } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
    ...Ionicons.font,
    "AbrilFatface-Regular": require("@/assets/fonts/AbrilFatface-Regular.ttf"),
    "FiraSans-Regular": require("@/assets/fonts/FiraSans-Regular.ttf"),
    "FiraSans-Medium": require("@/assets/fonts/FiraSans-Medium.ttf"),
    "FiraSans-Bold": require("@/assets/fonts/FiraSans-Bold.ttf"),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView>
      <ThemeProvider>
        <ThemeWrapper />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemeWrapper() {
  const { themePreference } = useThemeContext();

  // Force the appearance mode when theme is manually set
  useEffect(() => {
    if (themePreference === "light") {
      Appearance.setColorScheme("light");
    } else if (themePreference === "dark") {
      Appearance.setColorScheme("dark");
    } else {
      // System - let the OS control it
      Appearance.setColorScheme("unspecified");
    }
  }, [themePreference]);

  return (
    <UserProvider>
      <ViewProvider>
        <BookmarkProvider>
          <OwnedMediaProvider>
            <DownloadRequestProvider>
              <GenreProvider>
                <Stack
                  screenOptions={{
                    headerBackButtonDisplayMode: "minimal",
                  }}
                >
                  <Stack.Screen
                    name="(modal)"
                    options={{ presentation: "modal", headerShown: false }}
                  />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="profile"
                    options={{ headerShown: false, presentation: "card" }}
                  />
                  <Stack.Screen
                    name="settings"
                    options={{ headerShown: false, presentation: "card" }}
                  />
                  <Stack.Screen
                    name="details/[id]"
                    options={{
                      headerTransparent: true,
                      headerShadowVisible: false,
                      headerTitle: "",
                    }}
                  />
                  <Stack.Screen
                    name="genre/[genreId]"
                    options={{
                      headerTransparent: true,
                      headerShadowVisible: false,
                      headerTitle: "",
                    }}
                  />
                </Stack>
              </GenreProvider>
            </DownloadRequestProvider>
          </OwnedMediaProvider>
        </BookmarkProvider>
      </ViewProvider>
    </UserProvider>
  );
}
