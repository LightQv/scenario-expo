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
  TextField,
  Toggle,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  keyboardType,
  listRowBackground,
  listRowInsets,
  listStyle,
  onSubmit,
  pickerStyle,
  submitLabel,
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
  type SelectOption,
  type SonarrOptions,
  type SonarrSettings,
  getSonarrOptions,
  getSonarrSettings,
  patchSonarrSettings,
  testSonarrConnection,
} from "@/services/downloadSettings";

type PickerValue = string | number;

const hostedSectionModifiers = [
  listRowBackground("clear"),
  listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
];

export default function SonarrSettingsScreen() {
  const { colors } = useThemeContext();
  const [settings, setSettings] = useState<SonarrSettings | null>(null);
  const [options, setOptions] = useState<SonarrOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [connectionHint, setConnectionHint] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const onAirRecencyText = useNativeState("");

  useFocusEffect(
    useCallback(() => {
      getSonarrSettings().then(setSettings).catch(() => notifyError(i18n.t("toast.error")));
    }, []),
  );

  useEffect(() => {
    onAirRecencyText.value = settings?.on_air_recency_days?.toString() ?? "";
  }, [settings?.on_air_recency_days, onAirRecencyText]);

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
      setConnectionHint({ type: "error", message: i18n.t("screen.settings.common.connectionFailed") });
    }
  };

  const saveOnAirRecencyDays = async () => {
    const rawValue = onAirRecencyText.value.trim();
    if (!rawValue) return;
    const onAirRecencyDays = Number(rawValue);
    if (!Number.isFinite(onAirRecencyDays)) return;
    if (onAirRecencyDays !== settings?.on_air_recency_days) {
      await patch({ on_air_recency_days: onAirRecencyDays });
    }
  };

  const isEnabled = settings?.enabled ?? false;
  const qualityOptions = options?.quality_profiles ?? [];
  const languageOptions = options?.language_profiles ?? [];
  const rootOptions = options?.root_folders ?? [];
  const tagOptions = options?.tags ?? [];
  const tagWithCurrent = (current?: string | null): SelectOption[] => {
    if (!current || tagOptions.some((option) => option.value === current)) return tagOptions;
    return [{ label: current, value: current }, ...tagOptions];
  };

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
                    title={i18n.t("screen.settings.sonarr.title")}
                    description={i18n.t("screen.settings.sonarr.description")}
                    icon="tv"
                  >
                    <Host style={styles.cardToggleHost}>
                      <Toggle
                        label={i18n.t("screen.settings.sonarr.title")}
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
                    {i18n.t("screen.settings.sonarr.serverHint")}
                  </Text>
                </View>

                {isEnabled ? (
                  <>
                    <SettingsGroup>
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.url")}
                        value={settings?.url ?? undefined}
                        showDivider
                        onPress={() => router.push("/settings/downloads/sonarr/url")}
                      />
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.apiKey")}
                        value={settings?.api_key_set ? i18n.t("screen.settings.common.configured") : i18n.t("screen.settings.common.notConfigured")}
                        showDivider
                        onPress={() => router.push("/settings/downloads/sonarr/api-key")}
                      />
                      <SettingsNavigationRow
                        label={i18n.t("screen.settings.fields.webhookSecret")}
                        value={settings?.webhook_secret_set ? i18n.t("screen.settings.common.configured") : i18n.t("screen.settings.common.notConfigured")}
                        onPress={() => router.push("/settings/downloads/sonarr/webhook-secret")}
                      />
                    </SettingsGroup>

                    <View>
                      <SettingsGroup>
                        <SettingsNavigationRow
                          label={i18n.t("screen.settings.common.testConnection")}
                          labelColor={colors.main}
                          showChevron={false}
                          onPress={testConnection}
                        />
                      </SettingsGroup>
                      {connectionHint ? (
                        <Text style={[styles.hint, { color: connectionHint.type === "success" ? PlatformColor("systemGreen") : PlatformColor("systemRed") }]}> 
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
                  <Section title={i18n.t("screen.settings.sections.folders") ?? "Folders"}>
                    <NativePicker value={settings?.root_folder_path} options={rootOptions} onSelect={(root_folder_path) => patch({ root_folder_path })} />
                    <NativePicker value={settings?.anime_root_folder_path} options={rootOptions} onSelect={(anime_root_folder_path) => patch({ anime_root_folder_path })} />
                  </Section>

                  <Section title={i18n.t("screen.settings.sections.profiles") ?? "Profiles"} footer={<SwiftText>{i18n.t("screen.settings.sonarr.profilesFooter")}</SwiftText>}>
                    <NativePicker value={settings?.quality_profile_id} options={qualityOptions} onSelect={(quality_profile_id) => patch({ quality_profile_id })} />
                    <NativePicker value={settings?.on_air_quality_profile_id} options={qualityOptions} onSelect={(on_air_quality_profile_id) => patch({ on_air_quality_profile_id })} />
                    <NativePicker value={settings?.complete_quality_profile_id} options={qualityOptions} onSelect={(complete_quality_profile_id) => patch({ complete_quality_profile_id })} />
                    <NativePicker value={settings?.anime_quality_profile_id} options={qualityOptions} onSelect={(anime_quality_profile_id) => patch({ anime_quality_profile_id })} />
                  </Section>

                  <Section title={i18n.t("screen.settings.sections.languages") ?? "Languages"}>
                    <NativePicker value={settings?.language_profile_id} options={languageOptions} onSelect={(language_profile_id) => patch({ language_profile_id })} />
                    <NativePicker value={settings?.anime_language_profile_id} options={languageOptions} onSelect={(anime_language_profile_id) => patch({ anime_language_profile_id })} />
                  </Section>

                  <Section title={i18n.t("screen.settings.sections.tags") ?? "Tags"} footer={<SwiftText>{i18n.t("screen.settings.sonarr.tagsFooter")}</SwiftText>}>
                    <NativePicker value={settings?.anime_tag_label} options={tagWithCurrent(settings?.anime_tag_label)} onSelect={(anime_tag_label) => patch({ anime_tag_label })} />
                    <NativePicker value={settings?.on_air_tag_label} options={tagWithCurrent(settings?.on_air_tag_label)} onSelect={(on_air_tag_label) => patch({ on_air_tag_label })} />
                    <NativePicker value={settings?.complete_tag_label} options={tagWithCurrent(settings?.complete_tag_label)} onSelect={(complete_tag_label) => patch({ complete_tag_label })} />
                  </Section>

                  <Section title={i18n.t("screen.settings.sections.series") ?? "Series"}>
                    <NativePicker value={settings?.series_type} options={options.series_types} onSelect={(series_type) => patch({ series_type })} />
                    <NativePicker value={settings?.anime_series_type} options={options.series_types} onSelect={(anime_series_type) => patch({ anime_series_type })} />
                    <NativePicker value={settings?.monitor_mode} options={options.monitor_modes} onSelect={(monitor_mode) => patch({ monitor_mode })} />
                  </Section>

                  <Section title={i18n.t("screen.settings.sections.behavior")}>
                    <TextField
                      text={onAirRecencyText}
                      placeholder={i18n.t("screen.settings.fields.onAirRecencyDays")}
                      onFocusChange={(focused) => {
                        if (!focused) saveOnAirRecencyDays().catch(() => notifyError(i18n.t("toast.error")));
                      }}
                      modifiers={[keyboardType("numeric"), submitLabel("done"), onSubmit(() => saveOnAirRecencyDays().catch(() => notifyError(i18n.t("toast.error"))))]}
                    />
                    <Toggle label={i18n.t("screen.settings.fields.seasonFolder")} isOn={settings?.season_folder ?? true} onIsOnChange={(season_folder) => patch({ season_folder }).catch(() => notifyError(i18n.t("toast.error")))} modifiers={[toggleStyle("switch"), tint(colors.main)]} />
                    <Toggle label={i18n.t("screen.settings.fields.useAnimeSeriesType")} isOn={settings?.use_anime_series_type ?? true} onIsOnChange={(use_anime_series_type) => patch({ use_anime_series_type }).catch(() => notifyError(i18n.t("toast.error")))} modifiers={[toggleStyle("switch"), tint(colors.main)]} />
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

function NativePicker({ value, options, onSelect }: { value?: PickerValue | boolean | null; options: SelectOption[]; onSelect: (value: PickerValue) => Promise<unknown> }) {
  const pickerOptions = options.filter((option): option is SelectOption & { value: PickerValue } => typeof option.value === "string" || typeof option.value === "number");
  const selection = typeof value === "string" || typeof value === "number" ? value : null;
  const selected = pickerOptions.some((option) => option.value === selection);
  const optionsWithCurrent = selection !== null && !selected ? [{ label: `${selection}`, value: selection }, ...pickerOptions] : pickerOptions;

  return (
    <Picker selection={selection} onSelectionChange={(next) => { if (next !== null) onSelect(next).catch(() => notifyError(i18n.t("toast.error"))); }} modifiers={[pickerStyle("inline")]}> 
      {optionsWithCurrent.map((option) => <SwiftText key={`${option.value}`} modifiers={[tag(option.value)]}>{option.label}</SwiftText>)}
    </Picker>
  );
}

function OptionsState({ loading, error }: { loading: boolean; error: boolean }) {
  return (
    <Section title={i18n.t("screen.settings.common.options")}>
      <SwiftText>
        {loading ? i18n.t("screen.settings.common.loadingOptions") : error ? i18n.t("screen.settings.common.optionsError") : i18n.t("screen.settings.common.configureConnectionFirst")}
      </SwiftText>
    </Section>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PlatformColor("systemGroupedBackground") },
  host: { flex: 1, marginTop: -28 },
  hostedStack: { paddingHorizontal: TOKENS.margin.horizontal, gap: 22 },
  cardBlock: { gap: 8 },
  cardToggleHost: { paddingTop: 20, width: "100%" },
  serverHint: { paddingHorizontal: 20, fontSize: TOKENS.font.sm, lineHeight: 16 },
  hint: { marginTop: 8, paddingHorizontal: 16, fontSize: TOKENS.font.md },
});
