import {
  StyleSheet,
  Text,
  View,
  PlatformColor,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { TOKENS, FONTS } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";

type DetailHeaderProps = {
  /* Overall type */
  overview: string;
  videos?: Video[];

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
  overview,
  videos,
  releaseDate,
  runtime,
  status,
  firstAirDate,
  lastAirDate,
  numberOfSeasons,
  numberOfEpisodes,
}: DetailHeaderProps) {
  const { type } = useLocalSearchParams<{ type: string }>();

  // Find the first YouTube trailer
  const trailer = videos?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );
  const hasTrailer = !!trailer;

  // Handle trailer button press
  const handleTrailerPress = async () => {
    if (!trailer?.key) return;

    const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    const youtubeAppUrl = `vnd.youtube://watch?v=${trailer.key}`;

    try {
      // Try to open in YouTube app first
      const canOpen = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpen) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fallback to web browser (in-app)
        await WebBrowser.openBrowserAsync(youtubeUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          controlsColor: THEME_COLORS.main,
        });
      }
    } catch (error) {
      console.error("Error opening trailer:", error);
    }
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => (
      <Text key={index}>
        {line.trim()}
        {index < lines.length - 1 && (
          <Text style={{ lineHeight: 6 }}>{"\n"}</Text>
        )}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
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

      {/* Trailer Button */}
      {hasTrailer && (
        <TouchableOpacity
          style={styles.trailerButton}
          activeOpacity={0.7}
          onPress={handleTrailerPress}
        >
          <Ionicons name="play-circle" size={24} color="#fffff" />
          <Text style={styles.trailerText}>
            {i18n.t("screen.detail.media.trailer")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Synopsis Section */}
      <View>
        <Text style={[styles.synopsisText, { color: PlatformColor("label") }]}>
          {renderFormattedText(overview || i18n.t("error.noSynopsis"))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: TOKENS.margin.vertical * 2,
    gap: 16,
    backgroundColor: PlatformColor("systemBackground"),
  },
  metadataSection: {
    gap: 4,
  },
  metadataRow: {
    flexDirection: "column",
    justifyContent: "center",
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
  trailerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: THEME_COLORS.main,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: "stretch",
  },
  trailerText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  synopsisText: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
});
