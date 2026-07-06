import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { BADGE_COLORS } from "@/constants/theme";
import { apiFetch } from "@/services/instances";
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
  displayTier?: BadgeTier | "locked";
  mastered?: boolean;
  unlocked: boolean;
  unlockedAt?: string | null;
};

type BadgeApiResponse = {
  badges?: Array<{
    id: string;
    title?: string;
    description?: string;
    current: number;
    target: number;
    icon: string;
    tier: BadgeTier;
    unlocked: boolean;
    unlocked_at?: string | null;
  }>;
};

type ProfileBadgeStats = {
  movieCount: number;
  tvShowCount: number;
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
  { id: "movieCountI", metric: "movieCount", target: 25, icon: "film", tier: "bronze" },
  { id: "movieCountII", metric: "movieCount", target: 100, icon: "ticket", tier: "silver" },
  { id: "movieCountIII", metric: "movieCount", target: 500, icon: "star", tier: "gold" },
  { id: "movieCountIV", metric: "movieCount", target: 1000, icon: "videocam", tier: "platinum" },
  { id: "tvShowCountI", metric: "tvShowCount", target: 25, icon: "tv", tier: "bronze" },
  { id: "tvShowCountII", metric: "tvShowCount", target: 100, icon: "play-forward", tier: "silver" },
  { id: "tvShowCountIII", metric: "tvShowCount", target: 500, icon: "albums", tier: "gold" },
  { id: "tvShowCountIV", metric: "tvShowCount", target: 1000, icon: "easel", tier: "platinum" },
  { id: "movieCollectionI", metric: "availableMovieCount", target: 10, icon: "archive", tier: "bronze" },
  { id: "movieCollectionII", metric: "availableMovieCount", target: 50, icon: "library", tier: "silver" },
  { id: "movieCollectionIII", metric: "availableMovieCount", target: 150, icon: "trophy", tier: "gold" },
  { id: "movieCollectionIV", metric: "availableMovieCount", target: 300, icon: "diamond", tier: "platinum" },
];

const BADGE_GROUPS = [
  ["movieCountI", "movieCountII", "movieCountIII", "movieCountIV"],
  ["tvShowCountI", "tvShowCountII", "tvShowCountIII", "tvShowCountIV"],
  ["movieCollectionI", "movieCollectionII", "movieCollectionIII", "movieCollectionIV"],
  ["downloadRequestI", "downloadRequestII", "downloadRequestIII", "downloadRequestIV"],
  ["watchlistCreatedI", "watchlistCreatedII", "watchlistCreatedIII", "watchlistCreatedIV"],
  ["watchlistMediaI", "watchlistMediaII", "watchlistMediaIII", "watchlistMediaIV"],
  ["genreBreadthI"],
  ["actionAdventureI", "actionAdventureII", "actionAdventureIII", "actionAdventureIV"],
  ["horrorI", "horrorII", "horrorIII", "horrorIV"],
  ["comedyI", "comedyII", "comedyIII", "comedyIV"],
  ["sciFiFantasyI", "sciFiFantasyII", "sciFiFantasyIII", "sciFiFantasyIV"],
  ["crimeThrillerMysteryI", "crimeThrillerMysteryII", "crimeThrillerMysteryIII", "crimeThrillerMysteryIV"],
  ["romanceI", "romanceII", "romanceIII", "romanceIV"],
  ["dramaI", "dramaII", "dramaIII", "dramaIV"],
  ["animationI", "animationII", "animationIII", "animationIV"],
  ["longMovieI"],
  ["classicMovieI"],
  ["doubleFeatureI"],
  ["mixedNightI"],
  ["seasonHunterI"],
  ["watchtimeI", "watchtimeII", "watchtimeIII", "watchtimeIV"],
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

export async function fetchProfileBadges(): Promise<ProfileBadge[]> {
  const response = (await apiFetch("/api/v1/badges")) as BadgeApiResponse;
  return (response.badges || []).map((badge) => ({
    id: badge.id,
    title: i18n.t(`screen.profile.badges.${badge.id}.title`, {
      defaultValue: badge.title || badge.id,
    }),
    description: i18n.t(`screen.profile.badges.${badge.id}.description`, {
      defaultValue: badge.description || "",
    }),
    current: Math.max(0, badge.current || 0),
    target: Math.max(1, badge.target || 1),
    icon: badge.icon as ComponentProps<typeof Ionicons>["name"],
    tier: badge.tier,
    unlocked: badge.unlocked,
    unlockedAt: badge.unlocked_at || null,
  }));
}

export function createCurrentBadgeDisplay(badges: ProfileBadge[]): ProfileBadge[] {
  const badgesById = new Map(badges.map((badge) => [badge.id, badge]));
  const groupedBadgeIds = new Set(BADGE_GROUPS.flat());
  const displayedBadges: ProfileBadge[] = [];
  const progressTiers: Array<BadgeTier | "locked"> = ["locked", "bronze", "silver", "gold"];

  BADGE_GROUPS.forEach((group) => {
    const groupBadges = group
      .map((badgeId) => badgesById.get(badgeId))
      .filter((badge): badge is ProfileBadge => Boolean(badge));
    if (!groupBadges.length) return;

    const currentBadgeIndex = groupBadges.findIndex((badge) => !badge.unlocked);
    if (currentBadgeIndex === -1) {
      displayedBadges.push({
        ...groupBadges[groupBadges.length - 1],
        displayTier: groupBadges[groupBadges.length - 1].tier,
        mastered: true,
      });
      return;
    }

    displayedBadges.push({
      ...groupBadges[currentBadgeIndex],
      displayTier: progressTiers[currentBadgeIndex] || "gold",
      mastered: false,
    });
  });

  badges.forEach((badge) => {
    if (!groupedBadgeIds.has(badge.id)) {
      displayedBadges.push(badge);
    }
  });

  return displayedBadges;
}
