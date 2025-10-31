import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import i18n from "@/services/i18n";

export default function ModalLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.login.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.register.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.forgotPassword.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="account"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.account.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="watchlist-create"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistCreate.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="watchlist-edit"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlistEdit.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="watchlist-move"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.move.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
      <Stack.Screen
        name="watchlist-add"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: i18n.t("screen.watchlist.add.title"),
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerLeft: () => <GoBackButton variant="close" />,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
          },
        }}
      />
    </Stack>
  );
}
