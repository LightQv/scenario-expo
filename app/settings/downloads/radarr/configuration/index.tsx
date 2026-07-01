import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import RadarrConfigurationFields from "@/components/settings/RadarrConfigurationFields";
import { notifyError } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import type { RadarrOptions, RadarrSettings } from "@/services/downloadSettings";
import {
  getRadarrOptions,
  getRadarrSettings,
  patchRadarrSettings,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";

export default function RadarrConfigurationDetailScreen() {
  const [settings, setSettings] = useState<RadarrSettings | null>(null);
  const [options, setOptions] = useState<RadarrOptions | null>(null);

  useEffect(() => {
    Promise.all([getRadarrSettings(), getRadarrOptions()])
      .then(([nextSettings, nextOptions]) => {
        setSettings(nextSettings);
        setOptions(nextOptions);
      })
      .catch(() => notifyError(i18n.t("toast.error")));
  }, []);

  const updateConfiguration = async (patch: Partial<RadarrSettings>) => {
    try {
      setSettings(await patchRadarrSettings(patch));
    } catch {
      notifyError(i18n.t("toast.error"));
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      i18n.t("screen.settings.radarr.deleteConfiguration.title"),
      i18n.t("screen.settings.radarr.deleteConfiguration.message"),
      [
        { text: i18n.t("screen.settings.common.cancel"), style: "cancel" },
        {
          text: i18n.t("screen.settings.radarr.deleteConfiguration.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await patchRadarrSettings({
                root_folder_path: null,
                quality_profile_id: null,
              });
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
      <Stack.Screen
        options={{ title: i18n.t("screen.settings.radarr.configurations.movie") }}
      />
      <View style={styles.content}>
        {settings ? (
          <RadarrConfigurationFields
            rootFolderPath={settings.root_folder_path}
            qualityProfileId={settings.quality_profile_id}
            rootOptions={options?.root_folders ?? []}
            qualityOptions={options?.quality_profiles ?? []}
            onRootFolderChange={(root_folder_path) =>
              updateConfiguration({ root_folder_path })
            }
            onQualityProfileChange={(quality_profile_id) =>
              updateConfiguration({ quality_profile_id })
            }
            onDelete={confirmDelete}
            deleteLabel={i18n.t("screen.settings.radarr.deleteConfiguration.row")}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  content: { flex: 1 },
});
