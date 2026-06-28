import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  PlatformColor,
} from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";
import { formatFullDate, formatRuntime } from "@/services/utils";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useDownloadRequestContext, useOwnedMediaContext } from "@/contexts";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";

export default function SeasonDetailScreen() {
  const { colors, isDark } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { seriesId, seasonNumber, seriesName } = useLocalSearchParams<{
    seriesId: string;
    seasonNumber: string;
    seriesName: string;
  }>();
  const [data, setData] = useState<SeasonDetail | null>(null);
  const [seasonAvailability, setSeasonAvailability] =
    useState<TvSeasonAvailability | null>(null);
  const navigation = useNavigation();
  const {
    getRequestForScope,
    isRequestingKey,
    refreshRequestStatus,
    requestSeasonDownload,
    retryRequest,
  } = useDownloadRequestContext();
  const { refreshTvSeasonAvailability } = useOwnedMediaContext();
  const numericSeriesId = Number(seriesId);
  const numericSeasonNumber = Number(seasonNumber);
  const seasonRequest = getRequestForScope(
    numericSeriesId,
    "tv",
    "season",
    numericSeasonNumber,
  );
  const isSeasonRequesting = isRequestingKey(
    `season:${numericSeriesId}:${numericSeasonNumber}`,
  );
  const canRetrySeasonRequest =
    seasonRequest?.status === "failed" || seasonRequest?.status === "not_found";

  // Fetch season details
  useEffect(() => {
    if (seriesId && seasonNumber) {
      setData(null);

      tmdbFetch(
        `/tv/${seriesId}/season/${seasonNumber}?language=${i18n.locale}`,
      )
        .then((response) => {
          setData(response);
        })
        .catch(() => {
          notifyError(i18n.t("toast.errorTMDB"));
        });
    }
  }, [seriesId, seasonNumber]);

  useEffect(() => {
    if (!numericSeriesId || !numericSeasonNumber) return;
    refreshTvSeasonAvailability(numericSeriesId, numericSeasonNumber).then(
      setSeasonAvailability,
    );
    refreshRequestStatus(numericSeriesId, "tv", "season", numericSeasonNumber);
  }, [numericSeasonNumber, numericSeriesId, refreshRequestStatus, refreshTvSeasonAvailability]);

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle:
        seriesName || i18n.t("screen.detail.media.seasons.season.singular"),
      headerTintColor: colors.text,
    });
  }, [navigation, colors.text, seriesName]);

  const handleDownloadSeason = async () => {
    try {
      if (canRetrySeasonRequest && seasonRequest) {
        await retryRequest(seasonRequest.id);
      } else {
        await requestSeasonDownload(numericSeriesId, numericSeasonNumber);
      }
      const nextAvailability = await refreshTvSeasonAvailability(
        numericSeriesId,
        numericSeasonNumber,
      );
      setSeasonAvailability(nextAvailability);
    } catch {
      // Context already displays the error toast.
    }
  };

  const statusStyle = isDark ? "light" : "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <HeaderActionCapsule
        actions={[
          {
            id: "more",
            label: "More actions",
            icon: "ellipsis",
            menu: [
              {
                id: "download-season",
                title: getSeasonDownloadTitle(
                  seasonAvailability,
                  seasonRequest,
                  isSeasonRequesting,
                  canRetrySeasonRequest,
                ),
                icon:
                  seasonAvailability?.status === "available"
                    ? "checkmark.circle"
                    : "tray.and.arrow.down",
                disabled:
                  seasonAvailability?.status === "available" ||
                  isSeasonRequesting ||
                  (!!seasonRequest &&
                    !canRetrySeasonRequest &&
                    seasonRequest.status !== "cancelled"),
                onPress: handleDownloadSeason,
              },
            ],
          },
        ]}
      />
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
                <View style={styles.seasonTitleRow}>
                  <Text
                    style={[styles.seasonName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {data.name}
                  </Text>

                  {seasonAvailability?.status && seasonAvailability.status !== "missing" && (
                    <View style={styles.availabilityBadge}>
                      <Text style={styles.availabilityBadgeText}>
                        {getAvailabilityLabel(seasonAvailability.status)}
                      </Text>
                    </View>
                  )}
                </View>

                {(data.air_date || data.episodes?.length) && (
                  <Text
                    style={[
                      styles.metadataText,
                      { color: isDark ? "#c9c9ce" : "#8e8e93" },
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
                      { color: isDark ? "#c9c9ce" : "#8e8e93" },
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
                    { color: colors.text },
                  ]}
                >
                  {i18n.t("screen.detail.media.seasons.episode.plurial")}
                </Text>

                {data.episodes.map((episode) => {
                  const episodeStatus = getEpisodeStatus(
                    seasonAvailability,
                    episode.episode_number,
                  );
                  const showEpisodeBadge =
                    seasonAvailability?.status === "partial" &&
                    (episodeStatus === "available" || episodeStatus === "missing");

                  return (
                    <View key={episode.id} style={styles.episodeCard}>
                      {showEpisodeBadge && (
                        <View
                          style={[
                            styles.episodeAvailabilityBadge,
                            episodeStatus === "available"
                              ? styles.episodeAvailableBadge
                              : styles.episodeMissingBadge,
                          ]}
                        >
                          <Text style={styles.episodeAvailabilityText}>
                            {getAvailabilityLabel(episodeStatus)}
                          </Text>
                        </View>
                      )}

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
                          tint={isDark ? "dark" : "light"}
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
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function getEpisodeStatus(
  seasonAvailability: TvSeasonAvailability | null,
  episodeNumber: number,
): TvAvailabilityStatus {
  return (
    seasonAvailability?.episodes.find(
      (episode) => episode.episode_number === episodeNumber,
    )?.status || "unknown"
  );
}

function getAvailabilityLabel(status: TvAvailabilityStatus) {
  if (status === "available") return i18n.t("screen.detail.media.available");
  if (status === "partial") return i18n.t("screen.detail.media.partiallyAvailable");
  if (status === "missing") return i18n.t("screen.detail.media.missing");
  return i18n.t("screen.detail.media.unknown");
}

function getSeasonDownloadTitle(
  seasonAvailability: TvSeasonAvailability | null,
  seasonRequest: DownloadRequest | null,
  isRequesting: boolean,
  canRetry: boolean,
) {
  if (seasonAvailability?.status === "available") {
    return i18n.t("screen.detail.download.seasonAvailable");
  }
  if (isRequesting) return i18n.t("screen.detail.download.requestingSeason");
  if (canRetry) return i18n.t("screen.detail.download.retrySeason");
  if (seasonRequest?.status === "downloading") {
    return i18n.t("screen.detail.download.downloadingSeason");
  }
  if (seasonRequest?.status === "searching") {
    return i18n.t("screen.detail.download.searchingSeason");
  }
  if (seasonRequest) return i18n.t("screen.detail.download.requested");
  if (seasonAvailability?.status === "partial") {
    return i18n.t("screen.detail.download.missingEpisodesAction");
  }
  return i18n.t("screen.detail.download.seasonAction");
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
  seasonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  seasonName: {
    flexShrink: 1,
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.title,
    lineHeight: 24,
  },
  metadataText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  availabilityBadge: {
    alignSelf: "flex-start",
    borderRadius: TOKENS.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: PlatformColor("systemGray5"),
  },
  availabilityBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.sm,
    color: PlatformColor("label"),
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
    position: "relative",
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
  episodeAvailabilityBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    borderRadius: TOKENS.radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  episodeAvailableBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.78)",
  },
  episodeMissingBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.52)",
  },
  episodeAvailabilityText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xs,
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
