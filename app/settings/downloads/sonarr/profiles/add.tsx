import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import GoBackButton from "@/components/ui/GoBackButton";
import SonarrProfileFields from "@/components/settings/SonarrProfileFields";
import { notifyError } from "@/components/toasts/Toast";
import type {
  SonarrOptions,
  SonarrProfileType,
  SonarrSettings,
} from "@/services/downloadSettings";
import {
  getSonarrOptions,
  getSonarrSettings,
  upsertSonarrProfile,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";
import { SONARR_PROFILE_TYPES } from "@/services/sonarrProfiles";

export default function AddSonarrProfileScreen() {
  const [settings, setSettings] = useState<SonarrSettings | null>(null);
  const [options, setOptions] = useState<SonarrOptions | null>(null);
  const [selectedType, setSelectedType] = useState<
    SonarrProfileType | undefined
  >();
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(null);
  const [qualityProfileId, setQualityProfileId] = useState<number | null>(null);
  const [languageProfileId, setLanguageProfileId] = useState<number | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getSonarrSettings(), getSonarrOptions()])
      .then(([nextSettings, nextOptions]) => {
        setSettings(nextSettings);
        setOptions(nextOptions);
      })
      .catch(() => notifyError(i18n.t("toast.error")));
  }, []);

  useEffect(() => {
    setRootFolderPath(null);
    setQualityProfileId(null);
    setLanguageProfileId(null);
  }, [selectedType]);

  const save = async () => {
    if (!selectedType || !rootFolderPath || qualityProfileId === null || saving)
      return;
    setSaving(true);
    try {
      await upsertSonarrProfile(selectedType, {
        root_folder_path: rootFolderPath,
        quality_profile_id: qualityProfileId,
        language_profile_id: languageProfileId,
      });
      router.back();
    } catch {
      notifyError(i18n.t("toast.error"));
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(
    selectedType && rootFolderPath && qualityProfileId !== null,
  );
  const availableTypes = SONARR_PROFILE_TYPES.filter(
    (type) => !settings?.profiles?.[type],
  );

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Stack.Screen
        options={{
          title: i18n.t("screen.settings.sonarr.addConfigurationTitle"),
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={i18n.t("screen.settings.common.validate")}
          disabled={!canSave || saving}
          icon={"checkmark" as never}
          onPress={save}
        >
          {i18n.t("screen.settings.common.validate")}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <View style={styles.content}>
        <SonarrProfileFields
          type={selectedType}
          rootFolderPath={rootFolderPath}
          qualityProfileId={qualityProfileId}
          languageProfileId={languageProfileId}
          rootOptions={options?.root_folders ?? []}
          qualityOptions={options?.quality_profiles ?? []}
          languageOptions={options?.language_profiles ?? []}
          availableTypes={availableTypes}
          onTypeChange={setSelectedType}
          onRootFolderChange={setRootFolderPath}
          onQualityProfileChange={setQualityProfileId}
          onLanguageProfileChange={setLanguageProfileId}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  content: { flex: 1, marginTop: -12 },
});
