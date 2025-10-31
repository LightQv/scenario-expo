import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { TOKENS, FONTS } from "@/constants/theme";
import i18n from "@/services/i18n";
import { formatTotalRuntime } from "@/services/utils";

type StatisticsPillsProps = {
  movieCount: number;
  tvCount: number;
  movieRuntime: number; // in minutes
  tvEpisodesCount: number;
};

export default function StatisticsPills({
  movieCount,
  tvCount,
  movieRuntime,
  tvEpisodesCount,
}: StatisticsPillsProps) {

  const formatMovieCount = () => {
    if (movieCount === 0) return `0 ${i18n.t("stats.movies")}`;
    if (movieCount === 1) return `${movieCount} ${i18n.t("stats.movie")}`;
    return `${movieCount} ${i18n.t("stats.movies")}`;
  };

  const formatTvCount = () => {
    if (tvCount === 0) return `0 ${i18n.t("stats.tvs")}`;
    if (tvCount === 1) return `${tvCount} ${i18n.t("stats.tv")}`;
    return `${tvCount} ${i18n.t("stats.tvs")}`;
  };

  const formatMovieRuntime = () => {
    return formatTotalRuntime(movieRuntime);
  };

  const formatTvEpisodes = () => {
    if (tvEpisodesCount === 0) return `0 ${i18n.t("stats.tvsRuntime")}`;
    if (tvEpisodesCount === 1)
      return `${tvEpisodesCount} ${i18n.t("stats.tvRuntime")}`;
    return `${tvEpisodesCount} ${i18n.t("stats.tvsRuntime")}`;
  };

  return (
    <View style={styles.container}>
      {/* Movie Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: PlatformColor("secondarySystemBackground") },
        ]}
      >
        <Text style={[styles.pillText, { color: PlatformColor("label") }]}>
          {formatMovieCount()}
        </Text>
      </View>

      {/* TV Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: PlatformColor("secondarySystemBackground") },
        ]}
      >
        <Text style={[styles.pillText, { color: PlatformColor("label") }]}>
          {formatTvCount()}
        </Text>
      </View>

      {/* Movie Runtime */}
      <View
        style={[
          styles.pill,
          { backgroundColor: PlatformColor("secondarySystemBackground") },
        ]}
      >
        <Text style={[styles.pillText, { color: PlatformColor("label") }]}>
          {formatMovieRuntime()}
        </Text>
      </View>

      {/* TV Episodes Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: PlatformColor("secondarySystemBackground") },
        ]}
      >
        <Text style={[styles.pillText, { color: PlatformColor("label") }]}>
          {formatTvEpisodes()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pillText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
  },
});
