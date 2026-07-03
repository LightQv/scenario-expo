import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BADGE_COLORS } from "@/constants/theme";
import i18n from "@/services/i18n";

export type BadgeTier = keyof Omit<typeof BADGE_COLORS, "locked">;

export type ProfileBadge = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  icon: ComponentProps<typeof Ionicons>["name"];
  tier: BadgeTier;
  unlocked: boolean;
};

type ProfileBadgeStats = {
  movieCount: number;
  tvEpisodesCount: number;
  availableMovieCount: number;
};

type BadgeDefinition = {
  id: string;
  metric: keyof ProfileBadgeStats;
  target: number;
  icon: ComponentProps<typeof Ionicons>["name"];
  tier: BadgeTier;
};

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first-scene", metric: "movieCount", target: 1, icon: "film", tier: "bronze" },
  { id: "movie-night", metric: "movieCount", target: 10, icon: "ticket", tier: "silver" },
  { id: "cinephile", metric: "movieCount", target: 50, icon: "star", tier: "gold" },
  { id: "pilot-episode", metric: "tvEpisodesCount", target: 1, icon: "tv", tier: "bronze" },
  { id: "binge-starter", metric: "tvEpisodesCount", target: 10, icon: "play-forward", tier: "silver" },
  { id: "seasoned", metric: "tvEpisodesCount", target: 25, icon: "albums", tier: "gold" },
  { id: "archivist-i", metric: "availableMovieCount", target: 10, icon: "archive", tier: "bronze" },
  { id: "archivist-ii", metric: "availableMovieCount", target: 50, icon: "library", tier: "silver" },
  { id: "archivist-iii", metric: "availableMovieCount", target: 100, icon: "trophy", tier: "gold" },
];

export function createProfileBadges(stats: ProfileBadgeStats): ProfileBadge[] {
  return BADGE_DEFINITIONS.map((badge) => {
    const current = Math.max(0, stats[badge.metric] || 0);

    return {
      ...badge,
      title: i18n.t(`screen.profile.badges.${badge.id}.title`),
      description: i18n.t(`screen.profile.badges.${badge.id}.description`),
      current,
      unlocked: current >= badge.target,
    };
  });
}
