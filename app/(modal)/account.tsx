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
import { Ionicons } from "@expo/vector-icons";

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

  const handleProfilePress = () => {
    router.back();
    router.push("/profile");
  };

  const handleViewsPress = (type: "movie" | "tv") => {
    router.push(`/profile/${type}`);
  };

  const handleSettingsPress = () => {
    router.push("/account-settings");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* User Profile Card */}
        <TouchableOpacity
          onPress={handleProfilePress}
          style={[
            styles.card,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={[styles.avatarLarge, { backgroundColor: themeColor }]}>
              <Text style={styles.avatarLargeText}>
                {user?.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.textContent}>
              <Text
                style={[styles.username, { color: PlatformColor("label") }]}
              >
                {user?.username}
              </Text>
              <Text
                style={[
                  styles.viewProfile,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {i18n.t("screen.account.viewProfile")}
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={PlatformColor("secondaryLabel")}
          />
        </TouchableOpacity>

        {/* Views Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: PlatformColor("label") }]}
          >
            {i18n.t("screen.account.views.title")}
          </Text>
          <View style={styles.sectionCards}>
            <TouchableOpacity
              onPress={() => handleViewsPress("movie")}
              style={[
                styles.card,
                styles.halfCard,
                { backgroundColor: PlatformColor("systemGray5") },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardText, { color: PlatformColor("label") }]}
                >
                  {i18n.t("screen.account.views.movies")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={PlatformColor("secondaryLabel")}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleViewsPress("tv")}
              style={[
                styles.card,
                styles.halfCard,
                { backgroundColor: PlatformColor("systemGray5") },
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardText, { color: PlatformColor("label") }]}
                >
                  {i18n.t("screen.account.views.tv")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={PlatformColor("secondaryLabel")}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings Card */}
        <TouchableOpacity
          onPress={handleSettingsPress}
          style={[
            styles.card,
            { backgroundColor: PlatformColor("systemGray5"), marginTop: 8 },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardText, { color: THEME_COLORS.main }]}>
              {i18n.t("screen.account.settings")}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={PlatformColor("secondaryLabel")}
          />
        </TouchableOpacity>

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
  card: {
    borderRadius: TOKENS.radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  textContent: {
    flex: 1,
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
    fontSize: 24,
  },
  username: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  viewProfile: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.lg,
    marginLeft: 4,
  },
  sectionCards: {
    flexDirection: "row",
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  cardText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  logoutButton: {
    height: 52,
    borderRadius: TOKENS.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  logoutButtonText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
});
