import { Stack } from "expo-router";
import { PlatformColor } from "react-native";
import i18n from "@/services/i18n";

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: true,
        headerTintColor: PlatformColor("label"),
        headerShadowVisible: false,
        headerTransparent: true,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerTitle: i18n.t("screen.login.title"),
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerTitle: i18n.t("screen.register.title"),
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerTitle: i18n.t("screen.forgotPassword.title"),
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          headerTitle: i18n.t("screen.account.title"),
        }}
      />
      <Stack.Screen
        name="watchlist-create"
        options={{
          headerTitle: i18n.t("screen.watchlistCreate.title"),
        }}
      />
      <Stack.Screen
        name="watchlist-edit"
        options={{
          headerTitle: i18n.t("screen.watchlistEdit.title"),
        }}
      />
      <Stack.Screen
        name="watchlist-move"
        options={{
          headerTitle: i18n.t("screen.watchlist.move.title"),
        }}
      />
      <Stack.Screen
        name="watchlist-add"
        options={{
          headerTitle: i18n.t("screen.watchlist.add.title"),
        }}
      />
      <Stack.Screen
        name="profile-banner-edit"
        options={{
          headerTitle: i18n.t("form.profile.update.banner.title"),
        }}
      />
    </Stack>
  );
}
