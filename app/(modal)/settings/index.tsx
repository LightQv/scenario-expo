import { router } from "expo-router";
import { PlatformColor, ScrollView, StyleSheet } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function SettingsScreen() {
  return (
    <>
      <GoBackButton variant="close" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SettingsGroup title={i18n.t("screen.settings.sections.appearance")}> 
          <SettingsNavigationRow
            label={i18n.t("screen.settings.theme.title")}
            icon="color-palette"
            onPress={() => router.push("/(modal)/settings/theme")}
          />
        </SettingsGroup>

        <SettingsGroup
          title={i18n.t("screen.settings.sections.downloads")}
          footer={i18n.t("screen.settings.downloads.footer")}
        >
          <SettingsNavigationRow
            label={i18n.t("screen.settings.downloads.title")}
            icon="arrow-down-circle"
            onPress={() => router.push("/(modal)/settings/downloads")}
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("screen.settings.sections.account")}> 
          <SettingsNavigationRow
            label={i18n.t("screen.settings.deleteAccount.title")}
            icon="trash"
            onPress={() => router.push("/(modal)/settings/delete-account")}
          />
        </SettingsGroup>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  content: {
    padding: TOKENS.margin.horizontal,
    paddingTop: TOKENS.modal.paddingTop,
    paddingBottom: 60,
    gap: 28,
  },
});
