import { View, StyleSheet, PlatformColor, useColorScheme } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import Banner from "@/components/details/Banner";
import GradientTransition from "@/components/details/GradientTransition";
import DetailHeader from "@/components/details/DetailHeader";
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
import GoBackButton from "@/components/ui/GoBackButton";
import ViewAction from "@/components/actions/ViewAction";
import DetailsActionsMenu from "@/components/details/DetailsActionsMenu";
import BookmarkButton from "@/components/ui/BookmarkButton";
import HeaderRight from "@/components/ui/HeaderRight";

export default function DetailsScreen() {
  const colorScheme = useColorScheme();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [data, setData] = useState<TmdbDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  // Shared value for scroll offset (replaces deprecated useScrollViewOffset)
  const scrollY = useSharedValue(0);

  // Fetch data based on type and id
  useEffect(() => {
    if (type && id) {
      setLoading(true);
      setData(null);
      scrollY.value = 0;

      // Different append_to_response for person vs media
      const appendParams =
        type === "person"
          ? "movie_credits,tv_credits,images"
          : "videos,credits,images";

      tmdbFetch(
        `/${type}/${id}?language=${i18n.locale}&append_to_response=${appendParams}`,
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
  }, [type, id]);

  // Status bar - always light for now (over the image)
  const statusStyle = colorScheme === "dark" ? "light" : "dark";

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
      headerLeft: () => <GoBackButton />,
      // Only show actions for movie and tv, not for person
      headerRight:
        type === "movie" || type === "tv"
          ? () =>
              data && (
                <HeaderRight>
                  <BookmarkButton
                    tmdbId={Number(id)}
                    mediaType={type}
                    title={data.title || data.name || ""}
                    posterPath={data.poster_path || ""}
                    backdropPath={data.backdrop_path || ""}
                    releaseDate={data.release_date}
                    firstAirDate={data.first_air_date}
                    runtime={data.runtime}
                    genreIds={data.genres?.map((g) => g.id) || []}
                  />
                  <ViewAction data={data} mediaType={type} size="details" />
                  <DetailsActionsMenu
                    mediaType={type}
                    tmdbId={id}
                    title={data.title || data.name || ""}
                  />
                </HeaderRight>
              )
          : undefined,
    });
  }, [navigation, type, data, id]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <StatusBar style={statusStyle} animated />

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        entering={FadeInLeft}
        exiting={FadeOutRight}
      >
        {data && (
          <>
            <Banner
              src={type === "person" ? data.profile_path : data.backdrop_path}
              alt={data.title || data.name}
              score={data.vote_average}
              title={data.title || data.name}
              genres={data.genres}
              scrollY={scrollY}
              gender={data.gender}
              birthday={data.birthday}
              deathday={data.deathday}
              knownForDepartment={data.known_for_department}
            />
            <GradientTransition />
            <DetailHeader
              overview={data.overview}
              videos={data.videos?.results}
              releaseDate={data.release_date}
              runtime={data.runtime}
              status={data.status}
              firstAirDate={data.first_air_date}
              lastAirDate={data.last_air_date}
              numberOfSeasons={data.number_of_seasons}
              numberOfEpisodes={data.number_of_episodes}
              biography={data.biography}
              birthday={data.birthday}
              placeOfBirth={data.place_of_birth}
              knownForDepartment={data.known_for_department}
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
                  />
                )}
              </>
            ) : (
              <>
                {/* Media: Show Crew and Cast */}
                {data.credits?.crew && data.credits.crew.length > 0 && (
                  <CrewInfo crew={data.credits.crew} mediaType={type} />
                )}
                {data.credits?.cast && data.credits.cast.length > 0 && (
                  <CastSection
                    title={i18n.t("screen.detail.media.cast")}
                    cast={data.credits.cast}
                  />
                )}
                {/* TV Shows: Show Seasons */}
                {type === "tv" && data.seasons && data.seasons.length > 0 && (
                  <SeasonsSection
                    title={i18n.t("screen.detail.media.seasons.title")}
                    seasons={data.seasons}
                    seriesId={id}
                    seriesName={data.name || data.title}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
});
