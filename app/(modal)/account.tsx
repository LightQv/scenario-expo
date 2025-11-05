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
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS, TOKENS, TOAST_COLORS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";

export default function AccountScreen() {
  const { logout, user } = useUserContext();
  const { colors } = useThemeContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
    router.back();
    router.push(`/profile/${type}`);
  };

  const handleAccountSettingsPress = () => {
    router.push("/(modal)/account-settings");
  };

  const handleApplicationSettingsPress = () => {
    router.push("/(modal)/application-settings");
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        {/* User Profile Card */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={[
              styles.card,
              { backgroundColor: PlatformColor("systemGray5") },
            ]}
            activeOpacity={BUTTON.opacity}
          >
            <View style={styles.cardContent}>
              <View
                style={[styles.avatarLarge, { backgroundColor: colors.main }]}
              >
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
          <Text
            style={[
              styles.profileDescription,
              { color: PlatformColor("secondaryLabel") },
            ]}
          >
            {i18n.t("screen.account.profileDescription")}
          </Text>
        </View>

        {/* Views Section */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: PlatformColor("label") }]}
          >
            {i18n.t("screen.account.views.title")}
          </Text>
          <View
            style={[
              styles.viewsContainer,
              { backgroundColor: PlatformColor("systemGray5") },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleViewsPress("movie")}
              style={styles.viewsOption}
              activeOpacity={BUTTON.opacity}
            >
              <Text
                style={[styles.cardText, { color: PlatformColor("label") }]}
              >
                {i18n.t("screen.account.views.movies")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={PlatformColor("secondaryLabel")}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.divider,
                { backgroundColor: PlatformColor("separator") },
              ]}
            />

            <TouchableOpacity
              onPress={() => handleViewsPress("tv")}
              style={styles.viewsOption}
              activeOpacity={BUTTON.opacity}
            >
              <Text
                style={[styles.cardText, { color: PlatformColor("label") }]}
              >
                {i18n.t("screen.account.views.tv")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={PlatformColor("secondaryLabel")}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Application Settings Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.viewsContainer,
              { backgroundColor: PlatformColor("systemGray5") },
            ]}
          >
            <TouchableOpacity
              onPress={handleApplicationSettingsPress}
              style={styles.viewsOption}
              activeOpacity={BUTTON.opacity}
            >
              <Text
                style={[styles.cardText, { color: PlatformColor("label") }]}
              >
                {i18n.t("screen.account.application.title")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={PlatformColor("secondaryLabel")}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <View
            style={[
              styles.viewsContainer,
              { backgroundColor: PlatformColor("systemGray5") },
            ]}
          >
            <TouchableOpacity
              onPress={handleAccountSettingsPress}
              style={styles.viewsOption}
              activeOpacity={BUTTON.opacity}
            >
              <Text style={[styles.cardText, { color: errorColor }]}>
                {i18n.t("screen.account.settings.title")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={errorColor} />
            </TouchableOpacity>
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
    paddingTop: TOKENS.modal.paddingTop,
  },
  container: {
    gap: 28,
  },
  profileSection: {
    gap: 8,
  },
  profileDescription: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    lineHeight: 16,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  card: {
    borderRadius: TOKENS.radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  viewsContainer: {
    borderRadius: TOKENS.radius.xl,
    overflow: "hidden",
  },
  viewsOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
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
