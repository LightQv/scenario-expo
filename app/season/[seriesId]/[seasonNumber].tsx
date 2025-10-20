import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  PlatformColor,
  Pressable,
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
import { Ionicons } from "@expo/vector-icons";

export default function SeasonDetailScreen() {
  const colorScheme = useColorScheme();
  const {
    seriesId,
    seasonNumber,
    seriesName,
  } = useLocalSearchParams<{
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
      headerTransparent: false,
      headerTitle: seriesName || "Season",
      headerLeft: () => (
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color={colorScheme === "dark" ? "#fff" : "#000"}
            style={{ marginLeft: 2 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, router, colorScheme, seriesName]);

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
        contentContainerStyle={styles.scrollContent}
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
                <Text style={[styles.seasonName, { color: PlatformColor("label") }]}>
                  {data.name}
                </Text>

                {data.air_date && (
                  <Text
                    style={[
                      styles.metadataText,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                  >
                    {formatFullDate(data.air_date)}
                  </Text>
                )}

                {data.overview && (
                  <Text
                    style={[
                      styles.overview,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
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
                  <View
                    key={episode.id}
                    style={[
                      styles.episodeCard,
                      { backgroundColor: PlatformColor("systemGray6") },
                    ]}
                  >
                    {episode.still_path && (
                      <Image
                        source={{
                          uri: `https://image.tmdb.org/t/p/w300/${episode.still_path}`,
                        }}
                        alt={episode.name}
                        style={styles.episodeImage}
                        contentFit="cover"
                        placeholder={BLURHASH.hash}
                        transition={BLURHASH.transition}
                      />
                    )}

                    <View style={styles.episodeInfo}>
                      <View style={styles.episodeHeader}>
                        <Text
                          style={[
                            styles.episodeNumber,
                            { color: PlatformColor("secondaryLabel") },
                          ]}
                        >
                          {i18n.t("screen.detail.media.seasons.episode.singular")}{" "}
                          {episode.episode_number}
                        </Text>
                        {episode.runtime && (
                          <Text
                            style={[
                              styles.episodeRuntime,
                              { color: PlatformColor("secondaryLabel") },
                            ]}
                          >
                            {formatRuntime(episode.runtime)}
                          </Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.episodeName,
                          { color: PlatformColor("label") },
                        ]}
                        numberOfLines={2}
                      >
                        {episode.name}
                      </Text>

                      {episode.overview && (
                        <Text
                          style={[
                            styles.episodeOverview,
                            { color: PlatformColor("secondaryLabel") },
                          ]}
                          numberOfLines={3}
                        >
                          {episode.overview}
                        </Text>
                      )}

                      {episode.air_date && (
                        <Text
                          style={[
                            styles.episodeDate,
                            { color: PlatformColor("tertiaryLabel") },
                          ]}
                        >
                          {formatFullDate(episode.air_date)}
                        </Text>
                      )}
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
    paddingTop: TOKENS.margin.vertical * 2,
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
    gap: 8,
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
  episodeImage: {
    width: "100%",
    height: 200,
    backgroundColor: PlatformColor("systemGray5"),
  },
  episodeInfo: {
    padding: 12,
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
  },
  episodeRuntime: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
  },
  episodeName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 20,
  },
  episodeOverview: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
    lineHeight: 18,
  },
  episodeDate: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
  },
});
