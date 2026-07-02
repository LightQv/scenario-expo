import { ColorValue, StyleSheet, View, Text, PlatformColor } from "react-native";
import { TOKENS, FONTS } from "@/constants/theme";
import i18n from "@/services/i18n";
import { formatTotalRuntime } from "@/services/utils";

type StatisticsPillsProps = {
  movieCount: number;
  tvCount: number;
  movieRuntime: number; // in minutes
  tvEpisodesCount: number;
  availableMovieCount: number;
  availableTvCount: number;
  showAvailableMovieCount: boolean;
  showAvailableTvCount: boolean;
  pillBackgroundColor?: ColorValue;
  textColor?: ColorValue;
};

export default function StatisticsPills({
  movieCount,
  tvCount,
  movieRuntime,
  tvEpisodesCount,
  availableMovieCount,
  availableTvCount,
  showAvailableMovieCount,
  showAvailableTvCount,
  pillBackgroundColor = PlatformColor("secondarySystemBackground"),
  textColor = PlatformColor("label"),
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

  const formatAvailableMovies = () => {
    if (availableMovieCount === 1)
      return `${availableMovieCount} ${i18n.t("stats.availableMovie")}`;
    return `${availableMovieCount} ${i18n.t("stats.availableMovies")}`;
  };

  const formatAvailableTvShows = () => {
    if (availableTvCount === 1)
      return `${availableTvCount} ${i18n.t("stats.availableTv")}`;
    return `${availableTvCount} ${i18n.t("stats.availableTvs")}`;
  };

  return (
    <View style={styles.container}>
      {/* Movie Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: pillBackgroundColor },
        ]}
      >
        <Text style={[styles.pillText, { color: textColor }]}> 
          {formatMovieCount()}
        </Text>
      </View>

      {/* TV Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: pillBackgroundColor },
        ]}
      >
        <Text style={[styles.pillText, { color: textColor }]}> 
          {formatTvCount()}
        </Text>
      </View>

      {/* Movie Runtime */}
      <View
        style={[
          styles.pill,
          { backgroundColor: pillBackgroundColor },
        ]}
      >
        <Text style={[styles.pillText, { color: textColor }]}> 
          {formatMovieRuntime()}
        </Text>
      </View>

      {/* TV Episodes Count */}
      <View
        style={[
          styles.pill,
          { backgroundColor: pillBackgroundColor },
        ]}
      >
        <Text style={[styles.pillText, { color: textColor }]}> 
          {formatTvEpisodes()}
        </Text>
      </View>

      {showAvailableMovieCount ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: pillBackgroundColor },
          ]}
        >
          <Text style={[styles.pillText, { color: textColor }]}> 
            {formatAvailableMovies()}
          </Text>
        </View>
      ) : null}

      {showAvailableTvCount ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: pillBackgroundColor },
          ]}
        >
          <Text style={[styles.pillText, { color: textColor }]}> 
            {formatAvailableTvShows()}
          </Text>
        </View>
      ) : null}
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
