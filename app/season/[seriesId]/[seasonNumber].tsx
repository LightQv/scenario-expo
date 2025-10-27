import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  PlatformColor,
  useColorScheme,
} from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Image } from "expo-image";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";
import { formatFullDate, formatRuntime } from "@/services/utils";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import GoBackButton from "@/components/ui/GoBackButton";

export default function SeasonDetailScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const { seriesId, seasonNumber, seriesName } = useLocalSearchParams<{
    seriesId: string;
    seasonNumber: string;
    seriesName: string;
  }>();
  const [data, setData] = useState<SeasonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  // Fetch season details
  useEffect(() => {
    if (seriesId && seasonNumber) {
      setLoading(true);
      setData(null);

      tmdbFetch(
        `/tv/${seriesId}/season/${seasonNumber}?language=${i18n.locale}`,
      )
        .then((response) => {
          setData(response);
          setLoading(false);
        })
        .catch(() => {
          notifyError(i18n.t("toast.errorTMDB"));
          setLoading(false);
        });
    }
  }, [seriesId, seasonNumber]);

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle:
        seriesName || i18n.t("screen.detail.media.seasons.season.singular"),
      headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
      headerLeft: () => <GoBackButton />,
    });
  }, [navigation, colorScheme, seriesName]);

  const statusStyle = colorScheme === "dark" ? "light" : "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <StatusBar style={statusStyle} animated />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60 },
        ]}
      >
        {data && (
          <>
            {/* Season Header */}
            <View style={styles.header}>
              {data.poster_path && (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500/${data.poster_path}`,
                  }}
                  alt={data.name}
                  style={styles.poster}
                  contentFit="cover"
                  placeholder={BLURHASH.hash}
                  transition={BLURHASH.transition}
                />
              )}

              <View style={styles.headerInfo}>
                <Text
                  style={[styles.seasonName, { color: PlatformColor("label") }]}
                >
                  {data.name}
                </Text>

                {(data.air_date || data.episodes?.length) && (
                  <Text
                    style={[
                      styles.metadataText,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                  >
                    {data.air_date && formatFullDate(data.air_date)}
                    {data.air_date && data.episodes?.length && " - "}
                    {data.episodes?.length &&
                      `${data.episodes.length} ${
                        data.episodes.length === 1
                          ? i18n.t(
                              "screen.detail.media.seasons.episode.singular",
                            )
                          : i18n.t(
                              "screen.detail.media.seasons.episode.plurial",
                            )
                      }`}
                  </Text>
                )}

                {/* Season Overview */}
                {data.overview && (
                  <Text
                    style={[
                      styles.overview,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                    numberOfLines={6}
                  >
                    {data.overview}
                  </Text>
                )}
              </View>
            </View>

            {/* Episodes List */}
            {data.episodes && data.episodes.length > 0 && (
              <View style={styles.episodesSection}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: PlatformColor("label") },
                  ]}
                >
                  {i18n.t("screen.detail.media.seasons.episode.plurial")}
                </Text>

                {data.episodes.map((episode) => (
                  <View key={episode.id} style={styles.episodeCard}>
                    {/* Visible Episode Image */}
                    <View style={styles.episodeImageContainer}>
                      <Image
                        source={{
                          uri: episode.still_path
                            ? `https://image.tmdb.org/t/p/w780/${episode.still_path}`
                            : undefined,
                        }}
                        alt={episode.name}
                        style={styles.episodeImage}
                        contentFit="cover"
                        placeholder={BLURHASH.hash}
                        transition={BLURHASH.transition}
                      />
                    </View>

                    {/* Info Section with Blurred Background */}
                    <View style={styles.episodeInfoSection}>
                      {/* Blurred Background Image */}
                      <Image
                        source={{
                          uri: episode.still_path
                            ? `https://image.tmdb.org/t/p/w780/${episode.still_path}`
                            : undefined,
                        }}
                        alt={episode.name}
                        style={styles.episodeBlurredBg}
                        contentFit="cover"
                        placeholder={BLURHASH.hash}
                        transition={BLURHASH.transition}
                        blurRadius={80}
                      />

                      {/* Blurred Overlay */}
                      <BlurView
                        intensity={90}
                        tint={colorScheme === "dark" ? "dark" : "light"}
                        style={styles.episodeOverlay}
                      >
                        <View style={styles.episodeInfo}>
                          <View style={styles.episodeHeader}>
                            <Text style={styles.episodeNumber}>
                              {i18n.t(
                                "screen.detail.media.seasons.episode.singular",
                              )}{" "}
                              {episode.episode_number}
                            </Text>
                            {episode.runtime && (
                              <Text style={styles.episodeRuntime}>
                                {formatRuntime(episode.runtime)}
                              </Text>
                            )}
                          </View>

                          <Text style={styles.episodeName} numberOfLines={2}>
                            {episode.name}
                          </Text>

                          {episode.overview && (
                            <Text
                              style={styles.episodeOverview}
                              numberOfLines={3}
                            >
                              {episode.overview}
                            </Text>
                          )}

                          {episode.air_date && (
                            <Text style={styles.episodeDate}>
                              {formatFullDate(episode.air_date)}
                            </Text>
                          )}
                        </View>
                      </BlurView>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: TOKENS.margin.horizontal,
    gap: 16,
  },
  poster: {
    width: 120,
    height: 177,
    borderRadius: 12,
    backgroundColor: PlatformColor("systemGray5"),
  },
  headerInfo: {
    flex: 1,
    gap: 10,
  },
  seasonName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.title,
    lineHeight: 24,
  },
  metadataText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  overview: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
    lineHeight: 20,
  },
  episodesSection: {
    marginTop: 24,
    paddingHorizontal: TOKENS.margin.horizontal,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
    marginBottom: 8,
  },
  episodeCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  episodeImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: PlatformColor("systemGray5"),
  },
  episodeImage: {
    width: "100%",
    height: "100%",
  },
  episodeInfoSection: {
    position: "relative",
    overflow: "hidden",
  },
  episodeBlurredBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  episodeOverlay: {
    width: "100%",
  },
  episodeInfo: {
    padding: 16,
    gap: 6,
  },
  episodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  episodeNumber: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.sm,
    textTransform: "uppercase",
    color: "#fff",
  },
  episodeRuntime: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    color: "#fff",
  },
  episodeName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 22,
    color: "#fff",
  },
  episodeOverview: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  episodeDate: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
