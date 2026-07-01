import { Stack } from "expo-router";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function ModalLayout() {
  const { colors } = useThemeContext();

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.login.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.register.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.forgotPassword.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.account.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="watchlist-create"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistCreate.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="watchlist-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistEdit.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="watchlist-move"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.move.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="watchlist-add"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.add.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="profile-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("form.profile.update.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="profile-banner-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("form.profile.update.banner.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.account.settings.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/theme"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.theme.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/delete-account"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.deleteAccount.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/downloads/index"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.downloads.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/downloads/radarr"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.radarr.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="settings/downloads/sonarr"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.settings.sonarr.title"),
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
