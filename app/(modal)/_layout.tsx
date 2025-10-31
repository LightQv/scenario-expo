import { Stack } from "expo-router";
import GoBackButton from "@/components/ui/GoBackButton";
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
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.register.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.forgotPassword.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.account.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="watchlist-create"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistCreate.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="watchlist-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistEdit.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="watchlist-move"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.move.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="watchlist-add"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.add.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="profile-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("form.profile.update.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
      <Stack.Screen
        name="profile-banner-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("form.profile.update.banner.title"),
          headerTintColor: colors.text,
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
        }}
      />
    </Stack>
  );
}
