import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useUserContext } from "@/contexts";
import { FONTS, TOKENS, THEME_COLORS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function AccountScreen() {
  const { logout, user } = useUserContext();

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
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.userHeader}>
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: THEME_COLORS.main },
              ]}
            >
              <Text style={styles.avatarLargeText}>
                {user?.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.username, { color: PlatformColor("label") }]}>
              {user?.username}
            </Text>
            <Text
              style={[styles.email, { color: PlatformColor("secondaryLabel") }]}
            >
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: THEME_COLORS.error }]}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>
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
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  container: {
    gap: 16,
  },
  section: {
    gap: 16,
  },
  userHeader: {
    alignItems: "center",
    gap: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 36,
  },
  username: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.title,
  },
  email: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
  },
  logoutButton: {
    height: 52,
    borderRadius: TOKENS.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
});
