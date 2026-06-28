import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import {
  HStack,
  Host,
  List,
  Section,
  Spacer,
  Text as SwiftText,
  Toggle,
} from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listStyle,
  padding,
  tint,
  toggleStyle,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import NativeSettingsDescriptionCard from "@/components/settings/NativeSettingsDescriptionCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import type {
  RadarrOptions,
  RadarrSettings,
  SelectOption,
} from "@/services/downloadSettings";
import {
  getRadarrOptions,
  getRadarrSettings,
  patchRadarrSettings,
  testRadarrConnection,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";

export default function RadarrSettingsScreen() {
  const { colors } = useThemeContext();
  const [settings, setSettings] = useState<RadarrSettings | null>(null);
  const [options, setOptions] = useState<RadarrOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [connectionHint, setConnectionHint] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      getRadarrSettings()
        .then(setSettings)
        .catch(() => notifyError(i18n.t("toast.error")));
    }, []),
  );

  useEffect(() => {
    if (!settings?.enabled || !settings.url || !settings.api_key_set) return;
    loadOptions();
  }, [settings?.enabled, settings?.url, settings?.api_key_set]);

  const patch = async (payload: Record<string, unknown>) => {
    const next = await patchRadarrSettings(payload);
    setSettings(next);
    return next;
  };

  const loadOptions = async () => {
    setLoadingOptions(true);
    setOptionsError(false);
    try {
      setOptions(await getRadarrOptions());
    } catch {
      setOptionsError(true);
    } finally {
      setLoadingOptions(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testRadarrConnection();
      setConnectionHint({
        type: "success",
        message: i18n.t("screen.settings.common.connectionSuccess", {
          name: result.name ?? "Radarr",
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
  const hasMovieConfiguration = Boolean(
    settings?.root_folder_path &&
      settings.quality_profile_id !== null &&
      settings.quality_profile_id !== undefined,
  );
  const qualityProfile = findOptionLabel(
    options?.quality_profiles ?? [],
    settings?.quality_profile_id,
  );

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section
            footer={
              <SwiftText
                modifiers={[
                  settingsRegularFont(TOKENS.font.md),
                  foregroundStyle({ type: "hierarchical", style: "secondary" }),
                  padding({ bottom: 8 }),
                ]}
              >
                {i18n.t("screen.settings.radarr.serverHint")}
              </SwiftText>
            }
          >
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.radarr.title")}
              description={i18n.t("screen.settings.radarr.description")}
              icon="film"
              tintColor={colors.main}
            >
              <HStack alignment="center" spacing={12}>
                <SwiftText modifiers={[settingsRegularFont(17)]}>
                  {i18n.t("screen.settings.radarr.title")}
                </SwiftText>
                <Spacer />
                <Toggle
                  isOn={isEnabled}
                  onIsOnChange={(enabled) =>
                    patch({ enabled }).catch(() =>
                      notifyError(i18n.t("toast.error")),
                    )
                  }
                  modifiers={[toggleStyle("switch"), tint(colors.main)]}
                />
              </HStack>
            </NativeSettingsDescriptionCard>
          </Section>

          {isEnabled ? (
            <>
              <Section>
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.url")}
                  value={settings?.url ?? undefined}
                  onPress={() => router.push("/settings/downloads/radarr/url")}
                />
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.apiKey")}
                  value={
                    settings?.api_key_set
                      ? i18n.t("screen.settings.common.configured")
                      : i18n.t("screen.settings.common.notConfigured")
                  }
                  onPress={() =>
                    router.push("/settings/downloads/radarr/api-key")
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
                    router.push("/settings/downloads/radarr/webhook-secret")
                  }
                />
              </Section>

              <Section
                footer={
                  connectionHint ? (
                    <SwiftText
                      modifiers={[
                        settingsRegularFont(TOKENS.font.md),
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
                header={
                  <SettingsSectionHeader
                    title={i18n.t("screen.settings.sections.configurations")}
                  />
                }
              >
                {hasMovieConfiguration ? (
                  <NativeSettingsRow
                    label={i18n.t("screen.settings.radarr.configurations.movie")}
                    value={qualityProfile}
                    onPress={() =>
                      router.push("/settings/downloads/radarr/configuration")
                    }
                  />
                ) : (
                  <SwiftText
                    modifiers={[
                      settingsRegularFont(),
                      foregroundStyle({
                        type: "hierarchical",
                        style: "secondary",
                      }),
                    ]}
                  >
                    {i18n.t("screen.settings.radarr.noConfigurations")}
                  </SwiftText>
                )}
              </Section>

              {!hasMovieConfiguration ? (
                <Section>
                  <NativeSettingsRow
                    label={i18n.t("screen.settings.radarr.addConfiguration")}
                    labelColor={colors.main}
                    onPress={() =>
                      router.push(
                        "/settings/downloads/radarr/configuration/add",
                      )
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
    <Section
      header={
        <SettingsSectionHeader
          title={i18n.t("screen.settings.common.options")}
        />
      }
    >
      <SwiftText
        modifiers={[
          settingsRegularFont(),
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

function findOptionLabel(
  options: SelectOption[],
  value?: string | number | null,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return options.find((option) => option.value === value)?.label ?? `${value}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: { flex: 1, marginTop: -14 },
});
