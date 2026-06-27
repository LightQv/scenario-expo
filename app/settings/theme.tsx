import { useState } from "react";
import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import {
  ColorPicker,
  DisclosureGroup,
  HStack,
  Host,
  List,
  Picker,
  Section,
  Spacer,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  listStyle,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import NativeSettingsDescriptionCard from "@/components/settings/NativeSettingsDescriptionCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import { notifySuccess } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";

type ThemePreference = "light" | "dark" | "system";

export default function ThemeSettingsScreen() {
  const [isAppearanceExpanded, setIsAppearanceExpanded] = useState(false);
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
        <List
          modifiers={[listStyle("insetGrouped")]}
        >
          <Section>
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.theme.title")}
              description={i18n.t("screen.settings.theme.description")}
              icon="paintpalette"
              tintColor={colors.main}
            />
          </Section>

          <Section title={i18n.t("screen.applicationSettings.appearance.title")}>
            <DisclosureGroup
              isExpanded={isAppearanceExpanded}
              onIsExpandedChange={setIsAppearanceExpanded}
            >
              <DisclosureGroup.Label>
                <HStack alignment="center" spacing={8}>
                  <SwiftText>
                    {i18n.t("screen.applicationSettings.appearance.mode")}
                  </SwiftText>
                  <Spacer />
                  <SwiftText
                    modifiers={[
                      foregroundStyle({
                        type: "hierarchical",
                        style: "secondary",
                      }),
                    ]}
                  >
                    {getThemePreferenceLabel(themePreference)}
                  </SwiftText>
                </HStack>
              </DisclosureGroup.Label>
              <Picker
                selection={themePreference}
                onSelectionChange={(next) => {
                  if (next) handleThemeChange(next as ThemePreference);
                }}
                modifiers={[pickerStyle("inline")]}
              >
                {renderThemePreferenceOptions()}
              </Picker>
            </DisclosureGroup>
          </Section>

          <Section title={i18n.t("screen.applicationSettings.colors.accent")}>
            <ColorPickerRow
              label={i18n.t("screen.applicationSettings.colors.light")}
              color={customColors.light}
              onColorChange={(color) => handleColorChange("light", color)}
            />
            <ColorPickerRow
              label={i18n.t("screen.applicationSettings.colors.dark")}
              color={customColors.dark}
              onColorChange={(color) => handleColorChange("dark", color)}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.applicationSettings.reset.button")}
              labelColor={colors.main}
              showChevron={false}
              onPress={handleReset}
            />
          </Section>
        </List>
      </Host>
    </View>
  );
}

function ColorPickerRow({
  label,
  color,
  onColorChange,
}: {
  label: string;
  color: string;
  onColorChange: (color: string) => void;
}) {
  return (
    <HStack alignment="center" spacing={12}>
      <SwiftText
        modifiers={[
          font({ size: TOKENS.font.xxl }),
          foregroundStyle(PlatformColor("label")),
        ]}
      >
        {label}
      </SwiftText>
      <Spacer />
      <ColorPicker
        key={`${label}-${color}`}
        selection={color}
        onSelectionChange={onColorChange}
      />
    </HStack>
  );
}

function renderThemePreferenceOptions() {
  return (
    <>
      <SwiftText modifiers={[tag("light")]}> 
        {i18n.t("screen.applicationSettings.theme.light")}
      </SwiftText>
      <SwiftText modifiers={[tag("dark")]}> 
        {i18n.t("screen.applicationSettings.theme.dark")}
      </SwiftText>
      <SwiftText modifiers={[tag("system")]}> 
        {i18n.t("screen.applicationSettings.theme.system")}
      </SwiftText>
    </>
  );
}

function getThemePreferenceLabel(preference: ThemePreference) {
  return i18n.t(`screen.applicationSettings.theme.${preference}`);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: { flex: 1, marginTop: -14 },
});
