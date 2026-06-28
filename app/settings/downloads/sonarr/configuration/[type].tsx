import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import GoBackButton from "@/components/ui/GoBackButton";
import SonarrConfigurationFields from "@/components/settings/SonarrConfigurationFields";
import { notifyError } from "@/components/toasts/Toast";
import type {
  SonarrConfigurationConfig,
  SonarrConfigurationType,
  SonarrOptions,
  SonarrSettings,
} from "@/services/downloadSettings";
import {
  deleteSonarrConfiguration,
  getSonarrOptions,
  getSonarrSettings,
  upsertSonarrConfiguration,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";
import {
  SONARR_CONFIGURATION_TYPES,
  getSonarrConfigurationLabel,
} from "@/services/sonarrConfigurations";

export default function SonarrConfigurationDetailScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const type = SONARR_CONFIGURATION_TYPES.includes(params.type as SonarrConfigurationType)
    ? (params.type as SonarrConfigurationType)
    : undefined;
  const [settings, setSettings] = useState<SonarrSettings | null>(null);
  const [options, setOptions] = useState<SonarrOptions | null>(null);

  useEffect(() => {
    Promise.all([getSonarrSettings(), getSonarrOptions()])
      .then(([nextSettings, nextOptions]) => {
        setSettings(nextSettings);
        setOptions(nextOptions);
      })
      .catch(() => notifyError(i18n.t("toast.error")));
  }, []);

  const configuration = type ? settings?.configurations?.[type] : undefined;

  const updateConfiguration = async (patch: Partial<SonarrConfigurationConfig>) => {
    if (!type || !configuration) return;
    const nextConfiguration = { ...configuration, ...patch };
    try {
      setSettings(await upsertSonarrConfiguration(type, nextConfiguration));
    } catch {
      notifyError(i18n.t("toast.error"));
    }
  };

  const confirmDelete = () => {
    if (!type) return;
    Alert.alert(
      i18n.t("screen.settings.sonarr.deleteConfiguration.title"),
      i18n.t("screen.settings.sonarr.deleteConfiguration.message", {
        name: getSonarrConfigurationLabel(type),
      }),
      [
        { text: i18n.t("screen.settings.common.cancel"), style: "cancel" },
        {
          text: i18n.t("screen.settings.sonarr.deleteConfiguration.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSonarrConfiguration(type);
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
        options={{ title: type ? getSonarrConfigurationLabel(type) : "" }}
      />
      <View style={styles.content}>
        {type && configuration ? (
          <>
            <SonarrConfigurationFields
              type={type}
              rootFolderPath={configuration.root_folder_path}
              qualityProfileId={configuration.quality_profile_id}
              languageProfileId={configuration.language_profile_id}
              rootOptions={options?.root_folders ?? []}
              qualityOptions={options?.quality_profiles ?? []}
              languageOptions={options?.language_profiles ?? []}
              onRootFolderChange={(root_folder_path) =>
                updateConfiguration({ root_folder_path })
              }
              onQualityProfileChange={(quality_profile_id) =>
                updateConfiguration({ quality_profile_id })
              }
              onLanguageProfileChange={(language_profile_id) =>
                updateConfiguration({ language_profile_id })
              }
              onDelete={confirmDelete}
              deleteLabel={i18n.t(
                "screen.settings.sonarr.deleteConfiguration.row",
              )}
            />
          </>
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
