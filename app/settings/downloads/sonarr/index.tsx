import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import { Host, List, Section, Text as SwiftText } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  listRowBackground,
  listStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import NativeDownloadIntegrationCard from "@/components/settings/NativeDownloadIntegrationCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";
import {
  type SonarrOptions,
  type SonarrProfileType,
  type SonarrSettings,
  getSonarrOptions,
  getSonarrSettings,
  patchSonarrSettings,
  testSonarrConnection,
} from "@/services/downloadSettings";
import {
  SONARR_PROFILE_TYPES,
  findOptionLabel,
  getSonarrProfileLabel,
} from "@/services/sonarrProfiles";

const hostedSectionModifiers = [listRowBackground("clear")];

export default function SonarrSettingsScreen() {
  const { colors } = useThemeContext();
  const [settings, setSettings] = useState<SonarrSettings | null>(null);
  const [options, setOptions] = useState<SonarrOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [connectionHint, setConnectionHint] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSonarrSettings()
        .then(setSettings)
        .catch(() => notifyError(i18n.t("toast.error")));
    }, []),
  );

  useEffect(() => {
    if (!settings?.enabled || !settings.url || !settings.api_key_set) return;
    loadOptions();
  }, [settings?.enabled, settings?.url, settings?.api_key_set]);

  const patch = async (payload: Record<string, unknown>) => {
    const next = await patchSonarrSettings(payload);
    setSettings(next);
    return next;
  };

  const loadOptions = async () => {
    setLoadingOptions(true);
    setOptionsError(false);
    try {
      setOptions(await getSonarrOptions());
    } catch {
      setOptionsError(true);
    } finally {
      setLoadingOptions(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testSonarrConnection();
      setConnectionHint({
        type: "success",
        message: i18n.t("screen.settings.common.connectionSuccess", {
          name: result.name ?? "Sonarr",
          version: result.version ? ` ${result.version}` : "",
        }),
      });
    } catch {
      setConnectionHint({
        type: "error",
        message: i18n.t("screen.settings.common.connectionFailed"),
      });
    }
  };

  const isEnabled = settings?.enabled ?? false;
  const configuredTypes = SONARR_PROFILE_TYPES.filter(
    (type) => settings?.profiles?.[type],
  );
  const canAddConfiguration =
    configuredTypes.length < SONARR_PROFILE_TYPES.length;

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section
            footer={
              <SwiftText
                modifiers={[
                  font({ size: TOKENS.font.md }),
                  foregroundStyle({ type: "hierarchical", style: "secondary" }),
                  padding({ bottom: 8 }),
                ]}
              >
                {i18n.t("screen.settings.sonarr.serverHint")}
              </SwiftText>
            }
          >
            <NativeDownloadIntegrationCard
              title={i18n.t("screen.settings.sonarr.title")}
              description={i18n.t("screen.settings.sonarr.description")}
              icon="display"
              isOn={isEnabled}
              tintColor={colors.main}
              onIsOnChange={(enabled) =>
                patch({ enabled }).catch(() =>
                  notifyError(i18n.t("toast.error")),
                )
              }
            />
          </Section>

          {isEnabled ? (
            <>
              <Section>
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.url")}
                  value={settings?.url ?? undefined}
                  onPress={() => router.push("/settings/downloads/sonarr/url")}
                />
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.apiKey")}
                  value={
                    settings?.api_key_set
                      ? i18n.t("screen.settings.common.configured")
                      : i18n.t("screen.settings.common.notConfigured")
                  }
                  onPress={() =>
                    router.push("/settings/downloads/sonarr/api-key")
                  }
                />
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.webhookSecret")}
                  value={
                    settings?.webhook_secret_set
                      ? i18n.t("screen.settings.common.configured")
                      : i18n.t("screen.settings.common.notConfigured")
                  }
                  onPress={() =>
                    router.push("/settings/downloads/sonarr/webhook-secret")
                  }
                />
              </Section>

              <Section
                footer={
                  connectionHint ? (
                    <SwiftText
                      modifiers={[
                        foregroundStyle(
                          connectionHint.type === "success"
                            ? PlatformColor("secondaryLabel")
                            : "red",
                        ),
                      ]}
                    >
                      {connectionHint.message}
                    </SwiftText>
                  ) : undefined
                }
              >
                <NativeSettingsRow
                  label={i18n.t("screen.settings.common.testConnection")}
                  labelColor={colors.main}
                  showChevron={false}
                  onPress={testConnection}
                />
              </Section>

              {!options ? (
                <OptionsState loading={loadingOptions} error={optionsError} />
              ) : null}
            </>
          ) : null}

          {isEnabled && options ? (
            <>
              <Section
                title={i18n.t("screen.settings.sections.configurations")}
              >
                {configuredTypes.length > 0 ? (
                  configuredTypes.map((type) => {
                    const profile = settings?.profiles?.[type];
                    const qualityProfile = findOptionLabel(
                      options.quality_profiles,
                      profile?.quality_profile_id,
                    );
                    return (
                      <NativeSettingsRow
                        key={type}
                        label={getSonarrProfileLabel(type)}
                        value={qualityProfile}
                        onPress={() =>
                          router.push(
                            `/settings/downloads/sonarr/profiles/${type}`,
                          )
                        }
                      />
                    );
                  })
                ) : (
                  <SwiftText
                    modifiers={[
                      foregroundStyle({
                        type: "hierarchical",
                        style: "secondary",
                      }),
                    ]}
                  >
                    {i18n.t("screen.settings.sonarr.noConfigurations")}
                  </SwiftText>
                )}
              </Section>

              {canAddConfiguration ? (
                <Section>
                  <NativeSettingsRow
                    label={i18n.t("screen.settings.sonarr.addConfiguration")}
                    labelColor={colors.main}
                    onPress={() =>
                      router.push("/settings/downloads/sonarr/profiles/add")
                    }
                  />
                </Section>
              ) : null}
            </>
          ) : null}
        </List>
      </Host>
    </View>
  );
}

function OptionsState({
  loading,
  error,
}: {
  loading: boolean;
  error: boolean;
}) {
  return (
    <Section title={i18n.t("screen.settings.common.options")}>
      <SwiftText
        modifiers={[
          foregroundStyle({ type: "hierarchical", style: "secondary" }),
        ]}
      >
        {loading
          ? i18n.t("screen.settings.common.loadingOptions")
          : error
            ? i18n.t("screen.settings.common.optionsError")
            : i18n.t("screen.settings.common.configureConnectionFirst")}
      </SwiftText>
    </Section>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: { flex: 1, marginTop: -14 },
});
