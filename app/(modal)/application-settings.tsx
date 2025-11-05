import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { useThemeContext } from "@/contexts";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";
import { notifySuccess } from "@/components/toasts/Toast";
import { ColorPicker, Host } from "@expo/ui/swift-ui";

type ThemePreference = "light" | "dark" | "system";

export default function ApplicationSettingsScreen() {
  const {
    themePreference,
    setThemePreference,
    customColors,
    setCustomColor,
    resetSettings,
    colors,
  } = useThemeContext();

  const handleThemeChange = async (preference: ThemePreference) => {
    await setThemePreference(preference);
  };

  const handleColorChange = async (mode: "light" | "dark", color: string) => {
    await setCustomColor(mode, color);
  };

  const handleReset = () => {
    Alert.alert(
      i18n.t("screen.applicationSettings.reset.button"),
      i18n.t("screen.applicationSettings.reset.confirm"),
      [
        {
          text: i18n.t("form.watchlist.cancel"),
          style: "cancel",
        },
        {
          text: i18n.t("screen.applicationSettings.reset.button"),
          style: "destructive",
          onPress: async () => {
            await resetSettings();
            notifySuccess(i18n.t("toast.success.settings.reset"));
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
      contentContainerStyle={styles.content}
    >
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: PlatformColor("label") }]}>
          {i18n.t("screen.applicationSettings.theme.title")}
        </Text>
        <View
          style={[
            styles.themeContainer,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
        >
          <Pressable
            style={[
              styles.themeOption,
              themePreference === "light" && styles.themeOptionActive,
              themePreference === "light" && {
                backgroundColor: colors.main,
              },
            ]}
            onPress={() => handleThemeChange("light")}
          >
            <Ionicons
              name="sunny"
              size={20}
              color={
                themePreference === "light"
                  ? "#fff"
                  : PlatformColor("secondaryLabel")
              }
            />
            <Text
              style={[
                styles.themeText,
                {
                  color:
                    themePreference === "light"
                      ? "#fff"
                      : PlatformColor("label"),
                },
              ]}
            >
              {i18n.t("screen.applicationSettings.theme.light")}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeOption,
              themePreference === "dark" && styles.themeOptionActive,
              themePreference === "dark" && {
                backgroundColor: colors.main,
              },
            ]}
            onPress={() => handleThemeChange("dark")}
          >
            <Ionicons
              name="moon"
              size={20}
              color={
                themePreference === "dark"
                  ? "#fff"
                  : PlatformColor("secondaryLabel")
              }
            />
            <Text
              style={[
                styles.themeText,
                {
                  color:
                    themePreference === "dark"
                      ? "#fff"
                      : PlatformColor("label"),
                },
              ]}
            >
              {i18n.t("screen.applicationSettings.theme.dark")}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.themeOption,
              themePreference === "system" && styles.themeOptionActive,
              themePreference === "system" && {
                backgroundColor: colors.main,
              },
            ]}
            onPress={() => handleThemeChange("system")}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={
                themePreference === "system"
                  ? "#fff"
                  : PlatformColor("secondaryLabel")
              }
            />
            <Text
              style={[
                styles.themeText,
                {
                  color:
                    themePreference === "system"
                      ? "#fff"
                      : PlatformColor("label"),
                },
              ]}
            >
              {i18n.t("screen.applicationSettings.theme.system")}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Colors Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: PlatformColor("label") }]}>
          {i18n.t("screen.applicationSettings.colors.title")}
        </Text>
        <View
          style={[
            styles.colorsContainer,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
        >
          {/* Light Mode Color */}
          <View style={styles.colorOption}>
            <Text style={[styles.colorText, { color: PlatformColor("label") }]}>
              {i18n.t("screen.applicationSettings.colors.light")}
            </Text>
            <Host matchContents>
              <ColorPicker
                key={`light-${customColors.light}`}
                selection={customColors.light}
                onValueChanged={(color) => handleColorChange("light", color)}
              />
            </Host>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: PlatformColor("separator") },
            ]}
          />

          {/* Dark Mode Color */}
          <View style={styles.colorOption}>
            <Text style={[styles.colorText, { color: PlatformColor("label") }]}>
              {i18n.t("screen.applicationSettings.colors.dark")}
            </Text>
            <Host matchContents>
              <ColorPicker
                key={`dark-${customColors.dark}`}
                selection={customColors.dark}
                onValueChanged={(color) => handleColorChange("dark", color)}
              />
            </Host>
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        onPress={handleReset}
        style={[
          styles.resetButton,
          { backgroundColor: PlatformColor("systemGray5") },
        ]}
        activeOpacity={BUTTON.opacity}
      >
        <Text style={[styles.resetButtonText, { color: colors.main }]}>
          {i18n.t("screen.applicationSettings.reset.button")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: TOKENS.margin.horizontal,
    gap: 28,
    paddingTop: TOKENS.modal.paddingTop,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.lg,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  themeContainer: {
    borderRadius: TOKENS.radius.xl,
    padding: 4,
    flexDirection: "row",
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: TOKENS.radius.xl,
  },
  themeOptionActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
  },
  colorsContainer: {
    borderRadius: TOKENS.radius.xl,
    overflow: "hidden",
  },
  colorOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  colorText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PlatformColor("separator"),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  pickerContainer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PlatformColor("separator"),
  },
  resetButton: {
    height: 52,
    borderRadius: TOKENS.radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  resetButtonText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
});
