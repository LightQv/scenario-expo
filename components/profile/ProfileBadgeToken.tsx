import { StyleSheet, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import type { BadgeTier } from "@/services/badges";

type ProfileBadgeTokenProps = {
  badgeId: string;
  tier: BadgeTier | "locked";
};

type BadgeAssetState = BadgeTier | "disabled";
type BadgeAssetPrefix = keyof typeof BADGE_ASSETS;

const BADGE_ASSETS = {
  action: {
    disabled: require("@/assets/badges/action_disabled.png"),
    bronze: require("@/assets/badges/action_bronze.png"),
    silver: require("@/assets/badges/action_silver.png"),
    gold: require("@/assets/badges/action_gold.png"),
    platinum: require("@/assets/badges/action_platinum.png"),
  },
  animation: {
    disabled: require("@/assets/badges/animation_disabled.png"),
    bronze: require("@/assets/badges/animation_bronze.png"),
    silver: require("@/assets/badges/animation_silver.png"),
    gold: require("@/assets/badges/animation_gold.png"),
    platinum: require("@/assets/badges/animation_platinum.png"),
  },
  bookmark: {
    disabled: require("@/assets/badges/bookmark_disabled.png"),
    bronze: require("@/assets/badges/bookmark_bronze.png"),
    silver: require("@/assets/badges/bookmark_silver.png"),
    gold: require("@/assets/badges/bookmark_gold.png"),
    platinum: require("@/assets/badges/bookmark_platinum.png"),
  },
  collection: {
    disabled: require("@/assets/badges/collection_disabled.png"),
    bronze: require("@/assets/badges/collection_bronze.png"),
    silver: require("@/assets/badges/collection_silver.png"),
    gold: require("@/assets/badges/collection_gold.png"),
    platinum: require("@/assets/badges/collection_platinum.png"),
  },
  comedy: {
    disabled: require("@/assets/badges/comedy_disabled.png"),
    bronze: require("@/assets/badges/comedy_bronze.png"),
    silver: require("@/assets/badges/comedy_silver.png"),
    gold: require("@/assets/badges/comedy_gold.png"),
    platinum: require("@/assets/badges/comedy_platinum.png"),
  },
  double_watch: {
    disabled: require("@/assets/badges/double_watch_disabled.png"),
    bronze: require("@/assets/badges/double_watch_bronze.png"),
    silver: require("@/assets/badges/double_watch_silver.png"),
    gold: require("@/assets/badges/double_watch_gold.png"),
    platinum: require("@/assets/badges/double_watch_platinum.png"),
  },
  download: {
    disabled: require("@/assets/badges/download_disabled.png"),
    bronze: require("@/assets/badges/download_bronze.png"),
    silver: require("@/assets/badges/download_silver.png"),
    gold: require("@/assets/badges/download_gold.png"),
    platinum: require("@/assets/badges/download_platinum.png"),
  },
  drama: {
    disabled: require("@/assets/badges/drama_disabled.png"),
    bronze: require("@/assets/badges/drama_bronze.png"),
    silver: require("@/assets/badges/drama_silver.png"),
    gold: require("@/assets/badges/drama_gold.png"),
    platinum: require("@/assets/badges/drama_platinum.png"),
  },
  horror: {
    disabled: require("@/assets/badges/horror_disabled.png"),
    bronze: require("@/assets/badges/horror_bronze.png"),
    silver: require("@/assets/badges/horror_silver.png"),
    gold: require("@/assets/badges/horror_gold.png"),
    platinum: require("@/assets/badges/horror_platinum.png"),
  },
  movie: {
    disabled: require("@/assets/badges/movie_disabled.png"),
    bronze: require("@/assets/badges/movie_bronze.png"),
    silver: require("@/assets/badges/movie_silver.png"),
    gold: require("@/assets/badges/movie_gold.png"),
    platinum: require("@/assets/badges/movie_platinum.png"),
  },
  multiverse: {
    disabled: require("@/assets/badges/multiverse_disabled.png"),
    bronze: require("@/assets/badges/multiverse_bronze.png"),
    silver: require("@/assets/badges/multiverse_silver.png"),
    gold: require("@/assets/badges/multiverse_gold.png"),
    platinum: require("@/assets/badges/multiverse_platinum.png"),
  },
  old_release: {
    disabled: require("@/assets/badges/old_release_disabled.png"),
    bronze: require("@/assets/badges/old_release_bronze.png"),
    silver: require("@/assets/badges/old_release_silver.png"),
    gold: require("@/assets/badges/old_release_gold.png"),
    platinum: require("@/assets/badges/old_release_platinum.png"),
  },
  romance: {
    disabled: require("@/assets/badges/romance_disabled.png"),
    bronze: require("@/assets/badges/romance_bronze.png"),
    silver: require("@/assets/badges/romance_silver.png"),
    gold: require("@/assets/badges/romance_gold.png"),
    platinum: require("@/assets/badges/romance_platinum.png"),
  },
  scify: {
    disabled: require("@/assets/badges/scify_disabled.png"),
    bronze: require("@/assets/badges/scify_bronze.png"),
    silver: require("@/assets/badges/scify_silver.png"),
    gold: require("@/assets/badges/scify_gold.png"),
    platinum: require("@/assets/badges/scify_platinum.png"),
  },
  season_download: {
    disabled: require("@/assets/badges/season_download_disabled.png"),
    bronze: require("@/assets/badges/season_download_bronze.png"),
    silver: require("@/assets/badges/season_download_silver.png"),
    gold: require("@/assets/badges/season_download_gold.png"),
    platinum: require("@/assets/badges/season_download_platinum.png"),
  },
  three_hours: {
    disabled: require("@/assets/badges/three_hours_disabled.png"),
    bronze: require("@/assets/badges/three_hours_bronze.png"),
    silver: require("@/assets/badges/three_hours_silver.png"),
    gold: require("@/assets/badges/three_hours_gold.png"),
    platinum: require("@/assets/badges/three_hours_platinum.png"),
  },
  thriller: {
    disabled: require("@/assets/badges/thriller_disabled.png"),
    bronze: require("@/assets/badges/thriller_bronze.png"),
    silver: require("@/assets/badges/thriller_silver.png"),
    gold: require("@/assets/badges/thriller_gold.png"),
    platinum: require("@/assets/badges/thriller_platinum.png"),
  },
  tv: {
    disabled: require("@/assets/badges/tv_disabled.png"),
    bronze: require("@/assets/badges/tv_bronze.png"),
    silver: require("@/assets/badges/tv_silver.png"),
    gold: require("@/assets/badges/tv_gold.png"),
    platinum: require("@/assets/badges/tv_platinum.png"),
  },
  twice_a_day: {
    disabled: require("@/assets/badges/twice_a_day_disabled.png"),
    bronze: require("@/assets/badges/twice_a_day_bronze.png"),
    silver: require("@/assets/badges/twice_a_day_silver.png"),
    gold: require("@/assets/badges/twice_a_day_gold.png"),
    platinum: require("@/assets/badges/twice_a_day_platinum.png"),
  },
  watchlist: {
    disabled: require("@/assets/badges/watchlist_disabled.png"),
    bronze: require("@/assets/badges/watchlist_bronze.png"),
    silver: require("@/assets/badges/watchlist_silver.png"),
    gold: require("@/assets/badges/watchlist_gold.png"),
    platinum: require("@/assets/badges/watchlist_platinum.png"),
  },
  watchtime: {
    disabled: require("@/assets/badges/watchtime_disabled.png"),
    bronze: require("@/assets/badges/watchtime_bronze.png"),
    silver: require("@/assets/badges/watchtime_silver.png"),
    gold: require("@/assets/badges/watchtime_gold.png"),
    platinum: require("@/assets/badges/watchtime_platinum.png"),
  },
} as const;

function getAssetPrefix(badgeId: string): BadgeAssetPrefix {
  const normalizedId = badgeId.toLowerCase();

  if (badgeId.startsWith("movieCount")) return "movie";
  if (badgeId.startsWith("tvShowCount")) return "tv";
  if (badgeId.startsWith("movieCollection")) return "collection";
  if (badgeId.startsWith("downloadRequest")) return "download";
  if (badgeId.startsWith("watchlistCreated")) return "watchlist";
  if (badgeId.startsWith("watchlistMedia")) return "bookmark";
  if (badgeId.startsWith("genreBreadth")) return "multiverse";
  if (badgeId.startsWith("actionAdventure")) return "action";
  if (badgeId.startsWith("horror")) return "horror";
  if (badgeId.startsWith("comedy")) return "comedy";
  if (badgeId.startsWith("sciFiFantasy")) return "scify";
  if (badgeId.startsWith("crimeThrillerMystery")) return "thriller";
  if (badgeId.startsWith("romance")) return "romance";
  if (badgeId.startsWith("drama")) return "drama";
  if (badgeId.startsWith("animation")) return "animation";
  if (badgeId.startsWith("watchtime")) return "watchtime";
  if (badgeId === "longMovieI") return "three_hours";
  if (badgeId === "classicMovieI") return "old_release";
  if (badgeId === "doubleFeatureI") return "twice_a_day";
  if (badgeId === "mixedNightI") return "double_watch";
  if (badgeId === "seasonHunterI") return "season_download";
  if (normalizedId.includes("movie")) return "movie";
  return "multiverse";
}

function getAssetState(tier: BadgeTier | "locked"): BadgeAssetState {
  return tier === "locked" ? "disabled" : tier;
}

export default function ProfileBadgeToken({ badgeId, tier }: ProfileBadgeTokenProps) {
  const source = BADGE_ASSETS[getAssetPrefix(badgeId)][getAssetState(tier)] as ImageSource;

  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} contentFit="contain" transition={100} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 66,
    height: 66,
  },
});
