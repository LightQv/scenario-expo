import {
  StyleSheet,
  Text,
  View,
  PlatformColor,
  TouchableOpacity,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { TOKENS, FONTS, BUTTON } from "@/constants/theme";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";

type DetailHeaderProps = {
  /* Overall type */
  title: string;
  originalTitle: string;
  genres: Genre[];
  overview: string;

  /* Movie type */
  releaseDate?: string;
  runtime?: number;

  /* TV type */
  status?: string;
  firstAirDate?: string;
  lastAirDate?: string | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
};

export default function DetailHeader({
  title,
  originalTitle,
  genres,
  overview,
  releaseDate,
  runtime,
  status,
  firstAirDate,
  lastAirDate,
  numberOfSeasons,
  numberOfEpisodes,
}: DetailHeaderProps) {
  const { type } = useLocalSearchParams<{ type: string }>();

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text
          style={[
            styles.title,
            { color: PlatformColor("label"), fontFamily: FONTS.abril },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {originalTitle !== title && (
          <Text
            style={[
              styles.originalTitle,
              { color: PlatformColor("secondaryLabel") },
            ]}
            numberOfLines={1}
          >
            {originalTitle}
          </Text>
        )}
      </View>

      {/* Genre Pills - Show only first 2 */}
      {genres && genres.length > 0 && (
        <View style={styles.genreContainer}>
          {genres.slice(0, 2).map((genre) => (
            <Link
              href={{
                pathname: "/discover",
                params: { type, genreId: genre.id },
              }}
              key={genre.id}
              asChild
            >
              <TouchableOpacity
                activeOpacity={BUTTON.opacity}
                style={[
                  styles.genrePill,
                  { backgroundColor: PlatformColor("systemGray5") },
                ]}
              >
                <Text
                  style={[styles.genreText, { color: PlatformColor("label") }]}
                >
                  {genre.name}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      {/* Metadata Section */}
      <View style={styles.metadataSection}>
        {type === "movie" && releaseDate && (
          <View style={styles.metadataRow}>
            <Text
              style={[
                styles.metadataText,
                { color: PlatformColor("secondaryLabel") },
              ]}
            >
              {formatFullDate(releaseDate)}
              {runtime && ` • ${formatRuntime(runtime)}`}
            </Text>
          </View>
        )}

        {type === "tv" && (
          <View style={styles.metadataRow}>
            {status && (
              <Text
                style={[styles.statusBadge, { color: PlatformColor("label") }]}
              >
                {status}
              </Text>
            )}
            <Text
              style={[
                styles.metadataText,
                { color: PlatformColor("secondaryLabel") },
              ]}
            >
              {firstAirDate && formatFullDate(firstAirDate)}
              {lastAirDate && ` - ${formatFullDate(lastAirDate)}`}
            </Text>
            {(numberOfSeasons || numberOfEpisodes) && (
              <Text
                style={[
                  styles.metadataText,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {numberOfSeasons &&
                  `${numberOfSeasons} ${
                    numberOfSeasons > 1
                      ? i18n.t("screen.detail.media.seasons.season.plurial")
                      : i18n.t("screen.detail.media.seasons.season.singular")
                  }`}
                {numberOfSeasons && numberOfEpisodes && " • "}
                {numberOfEpisodes &&
                  `${numberOfEpisodes} ${
                    numberOfEpisodes > 1
                      ? i18n.t("screen.detail.media.seasons.episode.plurial")
                      : i18n.t("screen.detail.media.seasons.episode.singular")
                  }`}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Synopsis Section */}
      <View style={styles.synopsisSection}>
        <Text style={[styles.synopsisText, { color: PlatformColor("label") }]}>
          {overview || i18n.t("error.noSynopsis")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingVertical: TOKENS.margin.vertical * 2,
    gap: 16,
    backgroundColor: PlatformColor("systemBackground"),
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  originalTitle: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.light,
    fontStyle: "italic",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genrePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  genreText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
  },
  metadataSection: {
    gap: 4,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  metadataText: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
  },
  statusBadge: {
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
  },
  synopsisSection: {
    marginTop: 4,
  },
  synopsisText: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
});
