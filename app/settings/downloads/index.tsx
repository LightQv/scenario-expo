import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { PlatformColor, ScrollView, StyleSheet, View } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import HeaderTitle from "@/components/ui/HeaderTitle";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";
import {
  type DownloadSettingsOverview,
  getDownloadSettingsOverview,
} from "@/services/downloadSettings";

export default function DownloadSettingsScreen() {
  const [overview, setOverview] = useState<DownloadSettingsOverview | null>(null);

  useFocusEffect(
    useCallback(() => {
      getDownloadSettingsOverview().then(setOverview).catch(() => {});
    }, []),
  );

  return (
    <View style={styles.container}>
      <GoBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <HeaderTitle title={i18n.t("screen.settings.downloads.title")} />
        <View style={styles.groups}>
          <SettingsDescriptionCard
            title={i18n.t("screen.settings.downloads.title")}
            description={i18n.t("screen.settings.downloads.description")}
            icon="arrow-down-circle"
          />

          <SettingsGroup>
            <SettingsNavigationRow
              label={i18n.t("screen.settings.radarr.title")}
              value={overview?.radarr.enabled ? i18n.t("screen.settings.common.on") : i18n.t("screen.settings.common.off")}
              showDivider
              onPress={() => router.push("/settings/downloads/radarr")}
            />
            <SettingsNavigationRow
              label={i18n.t("screen.settings.sonarr.title")}
              value={overview?.sonarr.enabled ? i18n.t("screen.settings.common.on") : i18n.t("screen.settings.common.off")}
              onPress={() => router.push("/settings/downloads/sonarr")}
            />
          </SettingsGroup>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  content: {
    padding: TOKENS.margin.horizontal,
    paddingTop: 200,
    paddingBottom: 60,
  },
  groups: {
    gap: 28,
  },
});
