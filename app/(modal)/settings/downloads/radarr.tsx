import { PlatformColor, ScrollView, StyleSheet } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsInfoRow from "@/components/settings/SettingsInfoRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function RadarrSettingsScreen() {
  const comingSoon = i18n.t("screen.settings.common.comingSoon");

  return (
    <>
      <GoBackButton variant="close" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SettingsDescriptionCard
          title={i18n.t("screen.settings.radarr.title")}
          description={i18n.t("screen.settings.radarr.description")}
          icon="film"
        />

        <SettingsGroup title={i18n.t("screen.settings.sections.status")}> 
          <SettingsInfoRow
            label={i18n.t("screen.settings.radarr.enable")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.radarr.testConnection")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.radarr.syncOwnedMovies")}
            value={comingSoon}
            disabled
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("screen.settings.sections.connection")}> 
          <SettingsInfoRow label="URL" value={comingSoon} showDivider disabled />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.apiKey")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.webhookSecret")}
            value={comingSoon}
            disabled
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("screen.settings.sections.library")}> 
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.rootFolder")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.qualityProfile")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.minimumAvailability")}
            value={comingSoon}
            disabled
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
