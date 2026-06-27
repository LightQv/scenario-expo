import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import RadarrConfigurationFields from "@/components/settings/RadarrConfigurationFields";
import { notifyError } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import type { RadarrOptions } from "@/services/downloadSettings";
import {
  getRadarrOptions,
  patchRadarrSettings,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";

export default function AddRadarrConfigurationScreen() {
  const [options, setOptions] = useState<RadarrOptions | null>(null);
  const [rootFolderPath, setRootFolderPath] = useState<string | null>(null);
  const [qualityProfileId, setQualityProfileId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRadarrOptions()
      .then(setOptions)
      .catch(() => notifyError(i18n.t("toast.error")));
  }, []);

  const save = async () => {
    if (!rootFolderPath || qualityProfileId === null || saving) return;
    setSaving(true);
    try {
      await patchRadarrSettings({
        root_folder_path: rootFolderPath,
        quality_profile_id: qualityProfileId,
      });
      router.back();
    } catch {
      notifyError(i18n.t("toast.error"));
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(rootFolderPath && qualityProfileId !== null);

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Stack.Screen
        options={{ title: i18n.t("screen.settings.radarr.addConfigurationTitle") }}
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
        <RadarrConfigurationFields
          rootFolderPath={rootFolderPath}
          qualityProfileId={qualityProfileId}
          rootOptions={options?.root_folders ?? []}
          qualityOptions={options?.quality_profiles ?? []}
          onRootFolderChange={setRootFolderPath}
          onQualityProfileChange={setQualityProfileId}
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
