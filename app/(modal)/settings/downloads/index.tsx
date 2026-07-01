import { router } from "expo-router";
import { PlatformColor, ScrollView, StyleSheet } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsInfoRow from "@/components/settings/SettingsInfoRow";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function DownloadSettingsScreen() {
  return (
    <>
      <GoBackButton variant="close" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SettingsDescriptionCard
          title={i18n.t("screen.settings.downloads.title")}
          description={i18n.t("screen.settings.downloads.description")}
          icon="arrow-down-circle"
        />

        <SettingsGroup>
          <SettingsInfoRow
            label={i18n.t("screen.settings.downloads.enable")}
            value={i18n.t("screen.settings.common.comingSoon")}
            disabled
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsNavigationRow
            label={i18n.t("screen.settings.radarr.title")}
            value={i18n.t("screen.settings.common.notConfigured")}
            showDivider
            onPress={() => router.push("/(modal)/settings/downloads/radarr")}
          />
          <SettingsNavigationRow
            label={i18n.t("screen.settings.sonarr.title")}
            value={i18n.t("screen.settings.common.notConfigured")}
            onPress={() => router.push("/(modal)/settings/downloads/sonarr")}
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
