import { router } from "expo-router";
import { PlatformColor, ScrollView, StyleSheet, View } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import HeaderTitle from "@/components/ui/HeaderTitle";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <GoBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <HeaderTitle title={i18n.t("screen.account.settings.title")} />

        <View style={styles.groups}>
          <SettingsGroup>
            <SettingsNavigationRow
              label={i18n.t("screen.settings.theme.title")}
              icon="color-palette"
              showDivider
              onPress={() => router.push("/settings/theme")}
            />
            <SettingsNavigationRow
              label={i18n.t("screen.settings.downloads.title")}
              icon="arrow-down-circle"
              onPress={() => router.push("/settings/downloads")}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsNavigationRow
              label={i18n.t("screen.settings.deleteAccount.title")}
              destructive
              showChevron={false}
              onPress={() => router.push("/settings/delete-account")}
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
