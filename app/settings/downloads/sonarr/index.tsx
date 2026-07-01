import { router, useFocusEffect, type Href } from "expo-router";
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
import i18n from "@/services/i18n";
import {
  type SonarrOptions,
  type SonarrSettings,
  getSonarrOptions,
  getSonarrSettings,
  patchSonarrSettings,
  testSonarrConnection,
} from "@/services/downloadSettings";
import {
  SONARR_CONFIGURATION_TYPES,
  findOptionLabel,
  getSonarrConfigurationLabel,
} from "@/services/sonarrConfigurations";
import { authenticateForSecretAccess } from "@/services/localAuthentication";

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

  const openSecretRoute = async (route: Href) => {
    const status = await authenticateForSecretAccess();
    if (status === "success") {
      router.push(route);
      return;
    }

    if (status === "unavailable") {
      notifyError(i18n.t("screen.settings.localAuth.unavailable"));
    }
  };

  const isEnabled = settings?.enabled ?? false;
  const configuredTypes = SONARR_CONFIGURATION_TYPES.filter(
    (type) => settings?.configurations?.[type],
  );
  const canAddConfiguration =
    configuredTypes.length < SONARR_CONFIGURATION_TYPES.length;
  const hasPartialConfigurations =
    configuredTypes.length > 0 &&
    configuredTypes.length < SONARR_CONFIGURATION_TYPES.length;

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
                {i18n.t("screen.settings.sonarr.serverHint")}
              </SwiftText>
            }
          >
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.sonarr.title")}
              description={i18n.t("screen.settings.sonarr.description")}
              icon="display"
              tintColor={colors.main}
            >
              <HStack alignment="center" spacing={12}>
                <SwiftText modifiers={[settingsRegularFont(17)]}>
                  {i18n.t("screen.settings.sonarr.title")}
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
                  onPress={() => router.push("/settings/downloads/sonarr/url")}
                />
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.apiKey")}
                  value={
                    settings?.api_key_set
                      ? i18n.t("screen.settings.common.configured")
                      : i18n.t("screen.settings.common.notConfigured")
                  }
                  onPress={() => openSecretRoute("/settings/downloads/sonarr/api-key")}
                />
                <NativeSettingsRow
                  label={i18n.t("screen.settings.fields.webhookSecret")}
                  value={
                    settings?.webhook_secret_set
                      ? i18n.t("screen.settings.common.configured")
                      : i18n.t("screen.settings.common.notConfigured")
                  }
                  onPress={() =>
                    openSecretRoute("/settings/downloads/sonarr/webhook-secret")
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
                footer={
                  hasPartialConfigurations ? (
                    <SwiftText
                      modifiers={[
                        settingsRegularFont(TOKENS.font.md),
                        foregroundStyle({
                          type: "hierarchical",
                          style: "secondary",
                        }),
                      ]}
                    >
                      {i18n.t("screen.settings.sonarr.partialConfigurationsWarning")}
                    </SwiftText>
                  ) : undefined
                }
              >
                {configuredTypes.length > 0 ? (
                  configuredTypes.map((type) => {
                    const configuration = settings?.configurations?.[type];
                    const qualityConfiguration = findOptionLabel(
                      options.quality_profiles,
                      configuration?.quality_profile_id,
                    );
                    return (
                      <NativeSettingsRow
                        key={type}
                        label={getSonarrConfigurationLabel(type)}
                        value={qualityConfiguration}
                        onPress={() =>
                          router.push(
                            `/settings/downloads/sonarr/configuration/${type}`,
                          )
                        }
                      />
                    );
                  })
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
                      router.push("/settings/downloads/sonarr/configuration/add")
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: { flex: 1, marginTop: -14 },
});
