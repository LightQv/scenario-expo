import { apiFetch } from "@/services/instances";

export type SelectOption = {
  label: string;
  value: string | number | boolean;
  meta?: Record<string, unknown>;
};

export type IntegrationSummary = {
  enabled: boolean;
  configured: boolean;
  url?: string | null;
  api_key_set: boolean;
  webhook_secret_set: boolean;
};

export type DownloadSettingsOverview = {
  radarr: IntegrationSummary;
  sonarr: IntegrationSummary;
};

export type RadarrSettings = IntegrationSummary & {
  root_folder_path?: string | null;
  quality_profile_id?: number | null;
};

export type SonarrConfigurationType = "tv_on_air" | "tv_complete" | "anime";

export type SonarrConfigurationConfig = {
  root_folder_path: string;
  quality_profile_id: number;
  language_profile_id?: number | null;
};

export type SonarrSettings = IntegrationSummary & {
  configurations: Partial<Record<SonarrConfigurationType, SonarrConfigurationConfig>>;
};

type ApiSonarrSettings = IntegrationSummary & {
  profiles?: Partial<Record<SonarrConfigurationType, SonarrConfigurationConfig>>;
  configurations?: Partial<Record<SonarrConfigurationType, SonarrConfigurationConfig>>;
};

export type RadarrOptions = {
  quality_profiles: SelectOption[];
  root_folders: SelectOption[];
};

export type SonarrOptions = {
  quality_profiles: SelectOption[];
  language_profiles: SelectOption[];
  root_folders: SelectOption[];
};

export type TestConnectionResponse = {
  ok: boolean;
  name?: string | null;
  version?: string | null;
};

export function getDownloadSettingsOverview(): Promise<DownloadSettingsOverview> {
  return apiFetch("/api/v1/user-settings/downloads");
}

export function getRadarrSettings(): Promise<RadarrSettings> {
  return apiFetch("/api/v1/user-settings/downloads/radarr");
}

export function patchRadarrSettings(payload: Partial<RadarrSettings> & Record<string, unknown>): Promise<RadarrSettings> {
  return apiFetch("/api/v1/user-settings/downloads/radarr", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getRadarrOptions(): Promise<RadarrOptions> {
  return apiFetch("/api/v1/user-settings/downloads/radarr/options");
}

export function testRadarrConnection(): Promise<TestConnectionResponse> {
  return apiFetch("/api/v1/user-settings/downloads/radarr/test", { method: "POST" });
}

export function getSonarrSettings(): Promise<SonarrSettings> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr").then(normalizeSonarrSettings);
}

export function patchSonarrSettings(payload: Partial<SonarrSettings> & Record<string, unknown>): Promise<SonarrSettings> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(normalizeSonarrSettings);
}

export function upsertSonarrConfiguration(type: SonarrConfigurationType, payload: SonarrConfigurationConfig): Promise<SonarrSettings> {
  return apiFetch(`/api/v1/user-settings/downloads/sonarr/profiles/${type}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }).then(normalizeSonarrSettings);
}

export function deleteSonarrConfiguration(type: SonarrConfigurationType): Promise<SonarrSettings> {
  return apiFetch(`/api/v1/user-settings/downloads/sonarr/profiles/${type}`, {
    method: "DELETE",
  }).then(normalizeSonarrSettings);
}

export function getSonarrOptions(): Promise<SonarrOptions> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr/options");
}

export function testSonarrConnection(): Promise<TestConnectionResponse> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr/test", { method: "POST" });
}

function normalizeSonarrSettings(settings: ApiSonarrSettings): SonarrSettings {
  return {
    ...settings,
    configurations: settings.configurations ?? settings.profiles ?? {},
  };
}
