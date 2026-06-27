import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import GoBackButton from "@/components/ui/GoBackButton";
import SonarrProfileFields from "@/components/settings/SonarrProfileFields";
import { notifyError } from "@/components/toasts/Toast";
import type {
  SonarrOptions,
  SonarrProfileConfig,
  SonarrProfileType,
  SonarrSettings,
} from "@/services/downloadSettings";
import {
  deleteSonarrProfile,
  getSonarrOptions,
  getSonarrSettings,
  upsertSonarrProfile,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";
import {
  SONARR_PROFILE_TYPES,
  getSonarrProfileLabel,
} from "@/services/sonarrProfiles";

export default function SonarrProfileDetailScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const type = SONARR_PROFILE_TYPES.includes(params.type as SonarrProfileType)
    ? (params.type as SonarrProfileType)
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

  const profile = type ? settings?.profiles?.[type] : undefined;

  const updateProfile = async (patch: Partial<SonarrProfileConfig>) => {
    if (!type || !profile) return;
    const nextProfile = { ...profile, ...patch };
    try {
      setSettings(await upsertSonarrProfile(type, nextProfile));
    } catch {
      notifyError(i18n.t("toast.error"));
    }
  };

  const confirmDelete = () => {
    if (!type) return;
    Alert.alert(
      i18n.t("screen.settings.sonarr.deleteConfiguration.title"),
      i18n.t("screen.settings.sonarr.deleteConfiguration.message", {
        name: getSonarrProfileLabel(type),
      }),
      [
        { text: i18n.t("screen.settings.common.cancel"), style: "cancel" },
        {
          text: i18n.t("screen.settings.sonarr.deleteConfiguration.confirm"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSonarrProfile(type);
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
        options={{ title: type ? getSonarrProfileLabel(type) : "" }}
      />
      <View style={styles.content}>
        {type && profile ? (
          <>
            <SonarrProfileFields
              type={type}
              rootFolderPath={profile.root_folder_path}
              qualityProfileId={profile.quality_profile_id}
              languageProfileId={profile.language_profile_id}
              rootOptions={options?.root_folders ?? []}
              qualityOptions={options?.quality_profiles ?? []}
              languageOptions={options?.language_profiles ?? []}
              onRootFolderChange={(root_folder_path) =>
                updateProfile({ root_folder_path })
              }
              onQualityProfileChange={(quality_profile_id) =>
                updateProfile({ quality_profile_id })
              }
              onLanguageProfileChange={(language_profile_id) =>
                updateProfile({ language_profile_id })
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
