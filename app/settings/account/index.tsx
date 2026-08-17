import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import { Host, List, Section, Text as SwiftText } from "@expo/ui/swift-ui";
import { foregroundStyle, listStyle } from "@expo/ui/swift-ui/modifiers";
import NativeSettingsDescriptionCard from "@/components/settings/NativeSettingsDescriptionCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import { useThemeContext, useUserContext } from "@/contexts";
import { authenticateForSecretAccess } from "@/services/localAuthentication";
import { type ApiTokenListItem, listApiTokens } from "@/services/apiTokens";
import i18n from "@/services/i18n";

const destructiveColor = PlatformColor("systemRed") as unknown as string;

export default function AccountSettingsScreen() {
  const { colors } = useThemeContext();
  const { user } = useUserContext();
  const [apiTokens, setApiTokens] = useState<ApiTokenListItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      listApiTokens()
        .then(setApiTokens)
        .catch(() => setApiTokens([]));
    }, []),
  );

  const openPasswordRoute = async () => {
    const status = await authenticateForSecretAccess({
      promptMessage: i18n.t("screen.settings.account.localAuth.prompt"),
    });
    if (status === "success") {
      router.push("/settings/account/password");
      return;
    }

    if (status === "unavailable") {
      notifyError(i18n.t("screen.settings.account.localAuth.unavailable"));
    }
  };

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}> 
          <Section>
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.account.title")}
              description={i18n.t("screen.settings.account.description")}
              icon="person.crop.circle"
              tintColor={colors.main}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.settings.account.username")}
              value={user?.username}
              onPress={() => router.push("/settings/account/username")}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.settings.account.email")}
              value={user?.email}
              onPress={() => router.push("/settings/account/email")}
            />
            <NativeSettingsRow
              label={i18n.t("screen.settings.account.password")}
              value={i18n.t("screen.settings.common.configured")}
              onPress={openPasswordRoute}
            />
          </Section>

          {apiTokens.length > 0 ? (
            <Section
              header={
                <SettingsSectionHeader
                  title={i18n.t("screen.settings.apiTokens.title")}
                />
              }
            >
              {apiTokens.map((token) => (
                <NativeSettingsRow
                  key={token.id}
                  label={token.name}
                  value={i18n.t("screen.settings.common.configured")}
                  onPress={() =>
                    router.push(`/settings/account/api-tokens/${token.id}` as Href)
                  }
                />
              ))}
            </Section>
          ) : null}

          <Section
            footer={
              <SwiftText
                modifiers={[
                  settingsRegularFont(TOKENS.font.md),
                  foregroundStyle({ type: "hierarchical", style: "secondary" }),
                ]}
              >
                {i18n.t("screen.settings.apiTokens.sectionFooter")}
              </SwiftText>
            }
          >
            <NativeSettingsRow
              label={i18n.t("screen.settings.apiTokens.add")}
              labelColor={colors.main}
              onPress={() => router.push("/settings/account/api-tokens/add" as Href)}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("screen.settings.deleteAccount.title")}
              labelColor={destructiveColor}
              showChevron={false}
              onPress={() => router.push("/settings/account/delete-account")}
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
  host: {
    flex: 1,
    marginTop: -12,
  },
});
