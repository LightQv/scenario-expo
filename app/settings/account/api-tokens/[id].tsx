import * as Clipboard from "expo-clipboard";
import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Host, List, Section, Text as SwiftText } from "@expo/ui/swift-ui";
import { foregroundStyle, listStyle } from "@expo/ui/swift-ui/modifiers";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import { TOKENS } from "@/constants/theme";
import { type ApiTokenDetail, getApiToken, revokeApiToken } from "@/services/apiTokens";
import i18n from "@/services/i18n";

const destructiveColor = PlatformColor("systemRed") as unknown as string;

export default function ApiTokenDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id;
  const [apiToken, setApiToken] = useState<ApiTokenDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    getApiToken(id)
      .then(setApiToken)
      .catch(() => notifyError(i18n.t("toast.error")));
  }, [id]);

  const copyToken = async () => {
    if (!apiToken?.token) return;
    await Clipboard.setStringAsync(apiToken.token);
    notifySuccess(i18n.t("screen.settings.apiTokens.copied"));
  };

  const confirmRevoke = () => {
    if (!id || !apiToken) return;
    Alert.alert(
      i18n.t("screen.settings.apiTokens.revokeTitle"),
      i18n.t("screen.settings.apiTokens.revokeMessage", { name: apiToken.name }),
      [
        { text: i18n.t("screen.settings.common.cancel"), style: "cancel" },
        {
          text: i18n.t("screen.settings.apiTokens.revokeConfirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await revokeApiToken(id);
              router.back();
            } catch {
              notifyError(i18n.t("toast.error"));
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Stack.Screen options={{ title: apiToken?.name ?? "" }} />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}> 
          {apiToken ? (
            <>
              <Section>
                <NativeSettingsRow label={i18n.t("screen.settings.apiTokens.name")} value={apiToken.name} showChevron={false} />
              </Section>

              <Section
                header={<SettingsSectionHeader title={i18n.t("screen.settings.apiTokens.token")} />}
                footer={
                  <SwiftText
                    modifiers={[
                      settingsRegularFont(TOKENS.font.md),
                      foregroundStyle({ type: "hierarchical", style: "secondary" }),
                    ]}
                  >
                    {i18n.t("screen.settings.apiTokens.detailFooter")}
                  </SwiftText>
                }
              >
                <SwiftText modifiers={[settingsRegularFont(TOKENS.font.md)]}>
                  {apiToken.token}
                </SwiftText>
                <NativeSettingsRow
                  label={i18n.t("screen.settings.apiTokens.copy")}
                  showChevron={false}
                  onPress={copyToken}
                />
              </Section>

              <Section>
                <NativeSettingsRow
                  label={i18n.t("screen.settings.apiTokens.revoke")}
                  labelColor={destructiveColor}
                  showChevron={false}
                  onPress={confirmRevoke}
                />
              </Section>
            </>
          ) : null}
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
  host: { flex: 1, marginTop: -12 },
});
