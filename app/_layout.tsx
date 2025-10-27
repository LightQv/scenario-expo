import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider, GenreProvider, UserProvider } from "@/contexts";
import { useColorScheme } from "react-native";
import { Toasts } from "@backpackapp-io/react-native-toast";
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
  const darkTheme = useColorScheme() === "dark";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <GenreProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              <Stack.Screen
                name="(modal)"
                options={{ presentation: "modal", headerShown: false }}
              />
            </Stack>
          </GenreProvider>
        </UserProvider>
        <Toasts overrideDarkMode={!darkTheme} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
