import { router } from "expo-router";
import { PlatformColor, StyleSheet, View } from "react-native";
import { Host, List, Section } from "@expo/ui/swift-ui";
import { listStyle } from "@expo/ui/swift-ui/modifiers";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsPageTitle from "@/components/settings/SettingsPageTitle";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";
import { TOKENS } from "@/constants/theme";

export default function SettingsScreen() {
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      <GoBackButton />
      <View style={styles.titleContainer}>
        <SettingsPageTitle title={i18n.t("screen.account.settings.title")} />
      </View>
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.settings.theme.title")}
              systemIcon="paintpalette"
              tintColor={colors.main}
              onPress={() => router.push("/settings/theme")}
            />
            <NativeSettingsRow
              label={i18n.t("screen.settings.downloads.title")}
              systemIcon="arrow.down.circle"
              tintColor={colors.main}
              onPress={() => router.push("/settings/downloads")}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.settings.deleteAccount.title")}
              labelColor="red"
              showChevron={false}
              onPress={() => router.push("/settings/delete-account")}
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
  titleContainer: {
    marginTop: 124,
    marginLeft: TOKENS.margin.horizontal,
  },
  host: { flex: 1 },
});
