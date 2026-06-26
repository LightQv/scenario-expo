import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";
import {
  Host,
  List,
  Picker,
  RNHostView,
  Section,
  Text as SwiftText,
  Toggle,
} from "@expo/ui/swift-ui";
import {
  listStyle,
  listRowBackground,
  listRowInsets,
  pickerStyle,
  tag,
  tint,
  toggleStyle,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsNavigationRow from "@/components/settings/SettingsNavigationRow";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";
import {
  type RadarrOptions,
  type RadarrSettings,
  type SelectOption,
  getRadarrOptions,
  getRadarrSettings,
  patchRadarrSettings,
  testRadarrConnection,
} from "@/services/downloadSettings";

type PickerValue = string | number;

const hostedSectionModifiers = [
  listRowBackground("clear"),
  listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
];

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

  return (
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section modifiers={hostedSectionModifiers}>
            <RNHostView matchContents>
              <View style={styles.hostedStack}>
                <View style={styles.cardBlock}>
                  <SettingsDescriptionCard
                    title={i18n.t("screen.settings.radarr.title")}
                    description={i18n.t("screen.settings.radarr.description")}
                    icon="film"
                  >
                    <Host style={styles.cardToggleHost}>
                      <Toggle
                        label={i18n.t("screen.settings.radarr.title")}
                        isOn={isEnabled}
                        onIsOnChange={(enabled) =>
                          patch({ enabled }).catch(() =>
                            notifyError(i18n.t("toast.error")),
                          )
                        }
                        modifiers={[toggleStyle("switch"), tint(colors.main)]}
                      />
                    </Host>
                  </SettingsDescriptionCard>
                  <Text
                    style={[
                      styles.serverHint,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                  >
                    {i18n.t("screen.settings.radarr.serverHint")}
                  </Text>
                </View>

                {isEnabled ? (
                  <>
                    <SettingsGroup>
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.url")}
                        value={settings?.url ?? undefined}
                        showDivider
                        onPress={() =>
                          router.push("/settings/downloads/radarr/url")
                        }
                      />
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.apiKey")}
                        value={
                          settings?.api_key_set
                            ? i18n.t("screen.settings.common.configured")
                            : i18n.t("screen.settings.common.notConfigured")
                        }
                        showDivider
                        onPress={() =>
                          router.push("/settings/downloads/radarr/api-key")
                        }
                      />
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.webhookSecret")}
                        value={
                          settings?.webhook_secret_set
                            ? i18n.t("screen.settings.common.configured")
                            : i18n.t("screen.settings.common.notConfigured")
                        }
                        onPress={() =>
                          router.push(
                            "/settings/downloads/radarr/webhook-secret",
                          )
                        }
                      />
                    </SettingsGroup>

                    <View>
                      <SettingsGroup>
                        <SettingsNavigationRow
                          label={i18n.t(
                            "screen.settings.common.testConnection",
                          )}
                          labelColor={colors.main}
                          showChevron={false}
                          onPress={testConnection}
                        />
                      </SettingsGroup>
                      {connectionHint ? (
                        <Text
                          style={[
                            styles.hint,
                            {
                              color:
                                connectionHint.type === "success"
                                  ? PlatformColor("secondaryLabel")
                                  : PlatformColor("systemRed"),
                            },
                          ]}
                        >
                          {connectionHint.message}
                        </Text>
                      ) : null}
                    </View>
                  </>
                ) : null}
              </View>
            </RNHostView>
          </Section>

          {isEnabled ? (
            <>
              {options ? (
                <>
                  <Section title={i18n.t("screen.settings.fields.rootFolder")}>
                    <NativePicker
                      value={settings?.root_folder_path}
                      options={options.root_folders}
                      onSelect={(root_folder_path) =>
                        patch({ root_folder_path })
                      }
                    />
                  </Section>
                  <Section
                    title={
                      i18n.t("screen.settings.sections.profiles") ?? "Profiles"
                    }
                  >
                    <NativePicker
                      value={settings?.quality_profile_id}
                      options={options.quality_profiles}
                      onSelect={(quality_profile_id) =>
                        patch({ quality_profile_id })
                      }
                    />
                  </Section>
                </>
              ) : (
                <OptionsState loading={loadingOptions} error={optionsError} />
              )}
            </>
          ) : null}
        </List>
      </Host>
    </View>
  );
}

function NativePicker({
  value,
  options,
  onSelect,
}: {
  value?: PickerValue | boolean | null;
  options: SelectOption[];
  onSelect: (value: PickerValue) => Promise<unknown>;
}) {
  const pickerOptions = options.filter(
    (option): option is SelectOption & { value: PickerValue } =>
      typeof option.value === "string" || typeof option.value === "number",
  );
  const selection =
    typeof value === "string" || typeof value === "number" ? value : null;
  const selected = pickerOptions.some((option) => option.value === selection);
  const optionsWithCurrent =
    selection !== null && !selected
      ? [{ label: `${selection}`, value: selection }, ...pickerOptions]
      : pickerOptions;

  return (
    <Picker
      selection={selection}
      onSelectionChange={(next) => {
        if (next !== null)
          onSelect(next).catch(() => notifyError(i18n.t("toast.error")));
      }}
      modifiers={[pickerStyle("inline")]}
    >
      {optionsWithCurrent.map((option) => (
        <SwiftText key={`${option.value}`} modifiers={[tag(option.value)]}>
          {option.label}
        </SwiftText>
      ))}
    </Picker>
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
      <SwiftText>
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
  host: { flex: 1, marginTop: -28 },
  hostedStack: { paddingHorizontal: TOKENS.margin.horizontal, gap: 22 },
  cardBlock: { gap: 8 },
  cardToggleHost: { paddingTop: 20, width: "100%" },
  serverHint: {
    paddingHorizontal: 20,
    fontSize: TOKENS.font.sm,
    lineHeight: 16,
  },
  hint: { marginTop: 8, paddingHorizontal: 16, fontSize: TOKENS.font.md },
});
