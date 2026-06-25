import { PlatformColor, ScrollView, StyleSheet } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsInfoRow from "@/components/settings/SettingsInfoRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function SonarrSettingsScreen() {
  const comingSoon = i18n.t("screen.settings.common.comingSoon");

  return (
    <>
      <GoBackButton variant="close" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <SettingsDescriptionCard
          title={i18n.t("screen.settings.sonarr.title")}
          description={i18n.t("screen.settings.sonarr.description")}
          icon="tv"
        />

        <SettingsGroup title={i18n.t("screen.settings.sections.status")}> 
          <SettingsInfoRow
            label={i18n.t("screen.settings.sonarr.enable")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.sonarr.testConnection")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.sonarr.syncOwnedTv")}
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

        <SettingsGroup title={i18n.t("screen.settings.sections.rootFolders")}> 
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.tvRootFolder")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.animeRootFolder")}
            value={comingSoon}
            disabled
          />
        </SettingsGroup>

        <SettingsGroup
          title={i18n.t("screen.settings.sections.profiles")}
          footer={i18n.t("screen.settings.sonarr.profilesFooter")}
        >
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.fallbackQualityProfile")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.onAirQualityProfile")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.completeQualityProfile")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.animeQualityProfile")}
            value={comingSoon}
            disabled
          />
        </SettingsGroup>

        <SettingsGroup
          title={i18n.t("screen.settings.sections.tags")}
          footer={i18n.t("screen.settings.sonarr.tagsFooter")}
        >
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.animeTag")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.onAirTag")}
            value={comingSoon}
            showDivider
            disabled
          />
          <SettingsInfoRow
            label={i18n.t("screen.settings.fields.completeTag")}
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
