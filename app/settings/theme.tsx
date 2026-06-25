import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  TouchableOpacity,
  Alert,
  Pressable,
} from "react-native";
import { useThemeContext } from "@/contexts";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";
import { notifySuccess } from "@/components/toasts/Toast";
import { ColorPicker, Host, List, RNHostView, Section } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listRowInsets,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";

type ThemePreference = "light" | "dark" | "system";

const hostedSectionModifiers = [
  listRowBackground("clear"),
  listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
];

export default function ThemeSettingsScreen() {
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
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}> 
          <Section modifiers={hostedSectionModifiers}>
            <RNHostView matchContents>
              <View style={styles.hostedStack}>
                <SettingsDescriptionCard
                  title={i18n.t("screen.settings.theme.title")}
                  description={i18n.t("screen.settings.theme.description")}
                  icon="color-palette"
                />

                <View style={styles.section}>
                <View
                  style={[
                    styles.themeContainer,
                    { backgroundColor: PlatformColor("secondarySystemGroupedBackground") },
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

                <View style={styles.section}>
                <View
                  style={[
                    styles.colorsContainer,
                    { backgroundColor: PlatformColor("secondarySystemGroupedBackground") },
                  ]}
                >
                  <View style={styles.colorOption}>
                    <Text style={[styles.colorText, { color: PlatformColor("label") }]}> 
                      {i18n.t("screen.applicationSettings.colors.light")}
                    </Text>
                    <Host matchContents>
                      <ColorPicker
                        key={`light-${customColors.light}`}
                        selection={customColors.light}
                        onSelectionChange={(color) => handleColorChange("light", color)}
                      />
                    </Host>
                  </View>

                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: PlatformColor("separator") },
                    ]}
                  />

                  <View style={styles.colorOption}>
                    <Text style={[styles.colorText, { color: PlatformColor("label") }]}> 
                      {i18n.t("screen.applicationSettings.colors.dark")}
                    </Text>
                    <Host matchContents>
                      <ColorPicker
                        key={`dark-${customColors.dark}`}
                        selection={customColors.dark}
                        onSelectionChange={(color) => handleColorChange("dark", color)}
                      />
                    </Host>
                  </View>
                </View>
                </View>

                <TouchableOpacity
                  onPress={handleReset}
                  style={[
                    styles.resetButton,
                    { backgroundColor: PlatformColor("secondarySystemGroupedBackground") },
                  ]}
                  activeOpacity={BUTTON.opacity}
                >
                  <Text style={[styles.resetButtonText, { color: colors.main }]}> 
                    {i18n.t("screen.applicationSettings.reset.button")}
                  </Text>
                </TouchableOpacity>
              </View>
            </RNHostView>
          </Section>
        </List>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: { flex: 1, marginTop: -28 },
  hostedStack: { paddingHorizontal: TOKENS.margin.horizontal, gap: 22 },
  section: {
    gap: 12,
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  resetButton: {
    height: 52,
    borderRadius: TOKENS.radius.xl,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  resetButtonText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
});
