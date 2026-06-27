import type { SelectOption, SonarrProfileType } from "@/services/downloadSettings";
import i18n from "@/services/i18n";

export const SONARR_PROFILE_TYPES: SonarrProfileType[] = ["tv_on_air", "tv_complete", "anime"];

export function getSonarrProfileLabel(type: SonarrProfileType): string {
  return i18n.t(`screen.settings.sonarr.profiles.${type}`);
}

export function getSonarrProfileTag(type: SonarrProfileType): string {
  switch (type) {
    case "anime":
      return "anime";
    case "tv_on_air":
      return "tv-onair";
    case "tv_complete":
      return "tv-complete";
  }
}

export function findOptionLabel(options: SelectOption[], value?: string | number | null): string | undefined {
  if (value === undefined || value === null) return undefined;
  return options.find((option) => option.value === value)?.label ?? `${value}`;
}
