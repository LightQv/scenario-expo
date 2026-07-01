import { Stack } from "expo-router";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";
import { FONTS } from "@/constants/theme";

export default function SettingsLayout() {
  const { colors } = useThemeContext();

  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: FONTS.regular } }}>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="account/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="account/username"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.account.editTitle.username"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="account/email"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.account.editTitle.email"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="account/password"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="account/delete-account"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/radarr/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/radarr/url"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.editTitle.url"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/radarr/api-key"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/radarr/webhook-secret"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/radarr/configuration/add"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.radarr.addConfigurationTitle"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/radarr/configuration/index"
        options={{
          headerShown: true,
          headerTitle: i18n.t("screen.settings.radarr.configurations.movie"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/url"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.editTitle.url"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/api-key"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/webhook-secret"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "",
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/configuration/add"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.sonarr.addConfigurationTitle"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/configuration/[type]"
        options={{
          headerShown: true,
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
