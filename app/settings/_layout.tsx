import { Stack } from "expo-router";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function SettingsLayout() {
  const { colors } = useThemeContext();

  return (
    <Stack>
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
        name="delete-account"
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
          headerTitle: i18n.t("screen.settings.editTitle.apiKey"),
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
          headerTitle: i18n.t("screen.settings.editTitle.webhookSecret"),
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
          headerTitle: i18n.t("screen.settings.radarr.profiles.movie"),
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
          headerTitle: i18n.t("screen.settings.editTitle.apiKey"),
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
          headerTitle: i18n.t("screen.settings.editTitle.webhookSecret"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/profiles/add"
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
        name="downloads/sonarr/profiles/[type]"
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
