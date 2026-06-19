import { View, StyleSheet } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import Banner from "@/components/details/Banner";
import DetailHeader from "@/components/details/DetailHeader";
import DetailsMediaControls from "@/components/details/DetailsMediaControls";
import CrewInfo from "@/components/details/CrewInfo";
import CastSection from "@/components/details/CastSection";
import CollapsibleCreditsSection from "@/components/details/CollapsibleCreditsSection";
import SeasonsSection from "@/components/details/SeasonsSection";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import DetailsHeaderActions from "@/components/details/DetailsHeaderActions";
import { useThemeContext } from "@/contexts";
import {
  getDetailPaletteFromImage,
  getFallbackDetailPalette,
  type DetailPalette,
} from "@/services/detailPalette";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export default function DetailsScreen() {
  const { isDark } = useThemeContext();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [data, setData] = useState<TmdbDetails | null>(null);
  const [palette, setPalette] = useState<DetailPalette>(() =>
    getFallbackDetailPalette(isDark),
  );
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  // Shared value for scroll offset (replaces deprecated useScrollViewOffset)
  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (!type || !id) return;

    let isMounted = true;

    async function loadDetails() {
      setLoading(true);
      setData(null);
      scrollY.value = 0;

      const appendParams =
        type === "person"
          ? "movie_credits,tv_credits,images"
          : "videos,credits,images";

      try {
        const response = await tmdbFetch(
          `/${type}/${id}?language=${i18n.locale}&append_to_response=${appendParams}`,
        );

        if (!isMounted) return;

        const imagePath = getDetailImagePath(response, type);
        const nextPalette = imagePath
          ? await getDetailPaletteFromImage(
              `${TMDB_IMAGE_BASE_URL}/${imagePath}`,
              isDark,
            ).catch(() => getFallbackDetailPalette(isDark))
          : getFallbackDetailPalette(isDark);

        if (!isMounted) return;

        setPalette(nextPalette);
        setData(response);
      } catch {
        if (isMounted) {
          notifyError(i18n.t("toast.errorTMDB"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [type, id, isDark]);

  const statusStyle = "light";

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {(type === "movie" || type === "tv") && data && (
        <DetailsHeaderActions data={data} mediaType={type} tmdbId={id} />
      )}
      <StatusBar style={statusStyle} animated />

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        entering={FadeInLeft}
        exiting={FadeOutRight}
      >
        {!loading && data && (
          <>
            <Banner
              src={getDetailImagePath(data, type)}
              alt={data.title || data.name}
              score={data.vote_average}
              title={data.title || data.name}
              genres={data.genres}
              scrollY={scrollY}
              gender={data.gender}
              birthday={data.birthday}
              deathday={data.deathday}
              knownForDepartment={data.known_for_department}
              releaseDate={data.release_date}
              runtime={data.runtime}
              status={data.status}
              firstAirDate={data.first_air_date}
              lastAirDate={data.last_air_date}
              numberOfSeasons={data.number_of_seasons}
              numberOfEpisodes={data.number_of_episodes}
              placeOfBirth={data.place_of_birth}
              palette={palette}
              controls={
                type === "movie" || type === "tv" ? (
                  <DetailsMediaControls
                    data={data}
                    mediaType={type}
                    tmdbId={id}
                    videos={data.videos?.results}
                    actionColor={palette.text}
                    palette={palette}
                  />
                ) : undefined
              }
            />
            <DetailHeader
              overview={data.overview}
              biography={data.biography}
              backgroundColor={palette.background}
              textColor={palette.text}
            />
            {type === "person" ? (
              <>
                {/* Person: Show Movie Credits */}
                {data.movie_credits && data.movie_credits.cast && (
                  <CollapsibleCreditsSection
                    title={i18n.t("screen.person.movies")}
                    credits={data.movie_credits.cast
                      .filter((movie) => movie.release_date)
                      .sort((a, b) => {
                        const dateA = new Date(a.release_date || "");
                        const dateB = new Date(b.release_date || "");
                        return dateB.getTime() - dateA.getTime();
                      })}
                    mediaType="movie"
                    backgroundColor={palette.background}
                    textColor={palette.text}
                    secondaryTextColor={palette.text}
                  />
                )}
                {/* Person: Show TV Credits */}
                {data.tv_credits && data.tv_credits.cast && (
                  <CollapsibleCreditsSection
                    title={i18n.t("screen.person.tvShows")}
                    credits={data.tv_credits.cast
                      .filter((tv) => tv.first_air_date)
                      .sort((a, b) => {
                        const dateA = new Date(a.first_air_date || "");
                        const dateB = new Date(b.first_air_date || "");
                        return dateB.getTime() - dateA.getTime();
                      })}
                    mediaType="tv"
                    backgroundColor={palette.background}
                    textColor={palette.text}
                    secondaryTextColor={palette.text}
                  />
                )}
              </>
            ) : (
              <>
                {/* Media: Show Crew and Cast */}
                {data.credits?.crew && data.credits.crew.length > 0 && (
                  <CrewInfo
                    crew={data.credits.crew}
                    mediaType={type}
                    backgroundColor={palette.background}
                    textColor={palette.text}
                    secondaryTextColor={palette.text}
                  />
                )}
                {data.credits?.cast && data.credits.cast.length > 0 && (
                  <CastSection
                    title={i18n.t("screen.detail.media.cast")}
                    cast={data.credits.cast}
                    backgroundColor={palette.background}
                    textColor={palette.text}
                    secondaryTextColor={palette.secondaryText}
                  />
                )}
                {/* TV Shows: Show Seasons */}
                {type === "tv" && data.seasons && data.seasons.length > 0 && (
                  <SeasonsSection
                    title={i18n.t("screen.detail.media.seasons.title")}
                    seasons={data.seasons}
                    seriesId={id}
                    seriesName={data.name || data.title}
                    backgroundColor={palette.background}
                    textColor={palette.text}
                    secondaryTextColor={palette.secondaryText}
                  />
                )}
              </>
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

function getDetailImagePath(
  data: TmdbDetails,
  type: string | undefined,
): string | undefined {
  if (type === "person") {
    return data.profile_path || data.backdrop_path || data.poster_path;
  }

  return data.backdrop_path || data.poster_path || data.profile_path;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
});
