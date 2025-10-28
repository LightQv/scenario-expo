import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { useUserContext } from "@/contexts";
import { FONTS, TOKENS, THEME_COLORS, TOAST_COLORS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function AccountScreen() {
  const { logout, user } = useUserContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const themeColor = isDark ? THEME_COLORS.accent : THEME_COLORS.main;
  const errorColor = isDark
    ? TOAST_COLORS.dark.error
    : TOAST_COLORS.light.error;

  const handleLogout = async () => {
    await logout();
    router.back();
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* User Info Card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
        >
          <View style={styles.userHeader}>
            <View style={[styles.avatarLarge, { backgroundColor: themeColor }]}>
              <Text style={styles.avatarLargeText}>
                {user?.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text
                style={[styles.username, { color: PlatformColor("label") }]}
              >
                {user?.username}
              </Text>
              <Text
                style={[
                  styles.email,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoutButtonText, { color: errorColor }]}>
            {i18n.t("form.auth.submit.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  scrollContent: {
    padding: TOKENS.margin.horizontal,
  },
  container: {
    gap: 16,
  },
  userCard: {
    borderRadius: TOKENS.radius.md,
    padding: 16,
  },
  userHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 28,
  },
  username: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  email: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  logoutButton: {
    height: 52,
    borderRadius: TOKENS.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
});
