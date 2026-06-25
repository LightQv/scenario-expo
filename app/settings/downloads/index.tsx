import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import { Host, List, RNHostView, Section } from "@expo/ui/swift-ui";
import {
  listRowBackground,
  listRowInsets,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";
import {
  type DownloadSettingsOverview,
  getDownloadSettingsOverview,
} from "@/services/downloadSettings";

const hostedSectionModifiers = [
  listRowBackground("clear"),
  listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
];

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
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}> 
          <Section modifiers={hostedSectionModifiers}>
            <RNHostView matchContents>
              <View style={styles.hostedStack}>
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
});
