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
  minimum_availability?: string | null;
};

export type SonarrSettings = IntegrationSummary & {
  root_folder_path?: string | null;
  anime_root_folder_path?: string | null;
  quality_profile_id?: number | null;
  on_air_quality_profile_id?: number | null;
  complete_quality_profile_id?: number | null;
  anime_quality_profile_id?: number | null;
  language_profile_id?: number | null;
  anime_language_profile_id?: number | null;
  series_type?: string | null;
  anime_series_type?: string | null;
  monitor_mode?: string | null;
  on_air_recency_days?: number | null;
  season_folder?: boolean | null;
  anime_tag_label?: string | null;
  on_air_tag_label?: string | null;
  complete_tag_label?: string | null;
  use_anime_series_type?: boolean | null;
};

export type RadarrOptions = {
  quality_profiles: SelectOption[];
  root_folders: SelectOption[];
  minimum_availability: SelectOption[];
};

export type SonarrOptions = {
  quality_profiles: SelectOption[];
  language_profiles: SelectOption[];
  root_folders: SelectOption[];
  tags: SelectOption[];
  series_types: SelectOption[];
  monitor_modes: SelectOption[];
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
  return apiFetch("/api/v1/user-settings/downloads/sonarr");
}

export function patchSonarrSettings(payload: Partial<SonarrSettings> & Record<string, unknown>): Promise<SonarrSettings> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getSonarrOptions(): Promise<SonarrOptions> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr/options");
}

export function testSonarrConnection(): Promise<TestConnectionResponse> {
  return apiFetch("/api/v1/user-settings/downloads/sonarr/test", { method: "POST" });
}
