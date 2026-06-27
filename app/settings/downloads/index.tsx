import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import { Host, List, Section } from "@expo/ui/swift-ui";
import { listStyle } from "@expo/ui/swift-ui/modifiers";
import NativeSettingsDescriptionCard from "@/components/settings/NativeSettingsDescriptionCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext } from "@/contexts";
import type { DownloadSettingsOverview } from "@/services/downloadSettings";
import { getDownloadSettingsOverview } from "@/services/downloadSettings";
import i18n from "@/services/i18n";

export default function DownloadSettingsScreen() {
  const { colors } = useThemeContext();
  const [overview, setOverview] = useState<DownloadSettingsOverview | null>(null);

  useFocusEffect(
    useCallback(() => {
      getDownloadSettingsOverview().then(setOverview).catch(() => {});
    }, []),
  );

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section>
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.downloads.title")}
              description={i18n.t("screen.settings.downloads.description")}
              icon="arrow.down.circle"
              tintColor={colors.main}
            />
          </Section>

          <Section title={i18n.t("screen.settings.sections.connection")}>
            <NativeSettingsRow
              label={i18n.t("screen.settings.radarr.title")}
              value={
                overview?.radarr.enabled
                  ? i18n.t("screen.settings.common.on")
                  : i18n.t("screen.settings.common.off")
              }
              onPress={() => router.push("/settings/downloads/radarr")}
            />
            <NativeSettingsRow
              label={i18n.t("screen.settings.sonarr.title")}
              value={
                overview?.sonarr.enabled
                  ? i18n.t("screen.settings.common.on")
                  : i18n.t("screen.settings.common.off")
              }
              onPress={() => router.push("/settings/downloads/sonarr")}
            />
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
  host: { flex: 1, marginTop: -14 },
});
