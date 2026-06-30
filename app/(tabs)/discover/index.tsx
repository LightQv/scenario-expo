import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  RefreshControl,
  Animated,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import DiscoverSection from "@/components/discover/DiscoverSection";
import MediaCard from "@/components/discover/MediaCard";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS } from "@/constants/theme";
import AnimatedHeader from "@/components/ui/AnimatedHeader";
import { useGenreContext } from "@/contexts/GenreContext";
import { useUserContext, useViewContext } from "@/contexts";
import ProfileHeaderButton from "@/components/ui/ProfileHeaderButton";

type SectionData = {
  id: string;
  title: string;
  data: TmdbData[];
  mediaType: string;
  queryPath: string;
  loading: boolean;
  cardSize?: "sm" | "md" | "xl";
  isFeatured?: boolean;
};

const PRIORITY_SECTION_IDS = new Set([
  "trending-week",
  "trending-persons",
  "popular-movies",
]);

function mergeLoadedSections(
  currentSections: SectionData[],
  loadedSections: SectionData[],
) {
  const loadedById = new Map(
    loadedSections.map((section) => [section.id, section]),
  );

  return currentSections.map(
    (section) => loadedById.get(section.id) || section,
  );
}

export default function DiscoverIndexScreen() {
  const { authState } = useUserContext();
  const { hasLoadedViews, isLoading: viewsLoading } = useViewContext();
  const { movieGenres, loading: genresLoading } = useGenreContext();
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [prioritySectionsLoaded, setPrioritySectionsLoaded] = useState(false);
  const [randomGenre, setRandomGenre] = useState<{ id: number; name: string } | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const hasHiddenSplashRef = useRef(false);
  const hasStartedInitialLoadRef = useRef(false);
  const loadRunRef = useRef(0);

  // Select the random genre once per provider load to avoid restarting Discover.
  useEffect(() => {
    if (randomGenre || !movieGenres || movieGenres.length === 0) return;

    const randomIndex = Math.floor(Math.random() * movieGenres.length);
    setRandomGenre(movieGenres[randomIndex]);
  }, [movieGenres, randomGenre]);

  const fetchSectionData = async (section: SectionData) => {
    try {
      // Handle queryPath that already has query params (like random genre)
      const hasQueryParams = section.queryPath.includes("?");
      let endpoint = hasQueryParams
        ? `/${section.queryPath}&language=${i18n.locale}&page=1`
        : `/${section.queryPath}?language=${i18n.locale}&page=1`;

      // Special parameters for certain sections
      if (section.id === "movies-2000s") {
        endpoint +=
          "&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31&sort_by=vote_average.desc&vote_count.gte=1000";
      }
      if (section.id === "top-rated-japanimation") {
        endpoint +=
          "&with_genres=16&with_origin_country=JP&with_origin_language=ja&sort_by=vote_average.desc&vote_count.gte=500";
      }
      if (
        section.id === "highly-rated-movies" ||
        section.id === "featured-movie"
      ) {
        endpoint +=
          "&vote_average.gte=6&sort_by=vote_average.desc&vote_count.gte=500";
      }
      if (section.id === "featured-movie") {
        endpoint += "&without_genres=99"; // Exclude documentaries (genre 99)
      }
      if (section.id === "top-rated-random-genre") {
        endpoint += "&sort_by=vote_average.desc&vote_count.gte=500";
      }

      const response = await tmdbFetch(endpoint);
      const results = response.results.slice(0, 10);

      // For featured movie section, select one random movie
      if (section.isFeatured && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        return {
          ...section,
          data: [results[randomIndex]], // Only one movie for featured
          loading: false,
        };
      }

      return {
        ...section,
        data: results,
        loading: false,
      };
    } catch (error) {
      console.error(`Error fetching ${section.id}:`, error);
      notifyError(i18n.t("toast.errorTMDB"));
      return {
        ...section,
        loading: false,
      };
    }
  };

  // Initialize sections with random genre
  const initialSections = useMemo(() => {
    return [
      {
        id: "trending-week",
        title: i18n.t("screen.discover.sections.trendingWeek"),
        data: [],
        mediaType: "all",
        queryPath: "trending/all/week",
        loading: true,
        cardSize: "md" as const,
      },
      {
        id: "trending-persons",
        title: i18n.t("screen.discover.sections.trendingPersons"),
        data: [],
        mediaType: "person",
        queryPath: "trending/person/week",
        loading: true,
      },
      {
        id: "popular-movies",
        title: i18n.t("screen.discover.sections.popularMovies"),
        data: [],
        mediaType: "movie",
        queryPath: "movie/popular",
        loading: true,
      },
      {
        id: "now-playing-movies",
        title: i18n.t("screen.discover.sections.nowPlayingMovies"),
        data: [],
        mediaType: "movie",
        queryPath: "movie/now_playing",
        loading: true,
      },
      {
        id: "highly-rated-movies",
        title: i18n.t("screen.discover.sections.highlyRatedMovies"),
        data: [],
        mediaType: "movie",
        queryPath: "discover/movie",
        loading: true,
      },
      {
        id: "featured-movie",
        title: i18n.t("screen.discover.sections.featuredMovie"),
        data: [],
        mediaType: "movie",
        queryPath: "discover/movie",
        loading: true,
        isFeatured: true,
      },
      {
        id: "upcoming-movies",
        title: i18n.t("screen.discover.sections.upcomingMovies"),
        data: [],
        mediaType: "movie",
        queryPath: "movie/upcoming",
        loading: true,
      },
      {
        id: "top-rated-tv",
        title: i18n.t("screen.discover.sections.topRatedTv"),
        data: [],
        mediaType: "tv",
        queryPath: "tv/top_rated",
        loading: true,
      },
      {
        id: "tv-upcoming",
        title: i18n.t("screen.discover.sections.runningTvShows"),
        data: [],
        mediaType: "tv",
        queryPath: "tv/on_the_air",
        loading: true,
      },
      {
        id: "top-rated-japanimation",
        title: i18n.t("screen.discover.sections.topRatedJapanimation"),
        data: [],
        mediaType: "tv",
        queryPath: "discover/tv",
        loading: true,
      },
      {
        id: "top-rated-random-genre",
        title: randomGenre
          ? `${i18n.t("screen.discover.sections.topRatedDocumentaries").replace("Documentaries", randomGenre.name)}`
          : i18n.t("screen.discover.sections.topRatedDocumentaries"),
        data: [],
        mediaType: "movie",
        queryPath: randomGenre
          ? `discover/movie?with_genres=${randomGenre.id}`
          : "discover/movie?with_genres=99",
        loading: true,
      },
      {
        id: "movies-2000s",
        title: i18n.t("screen.discover.sections.movies2000s"),
        data: [],
        mediaType: "movie",
        queryPath: "discover/movie",
        loading: true,
      },
    ];
  }, [randomGenre]);

  const loadStagedSections = useCallback(async (
    sectionsToLoad: SectionData[],
    options: { reset?: boolean } = {},
  ) => {
    const loadRun = loadRunRef.current + 1;
    loadRunRef.current = loadRun;
    const prioritySections = sectionsToLoad.filter((section) =>
      PRIORITY_SECTION_IDS.has(section.id),
    );
    const remainingSections = sectionsToLoad.filter(
      (section) => !PRIORITY_SECTION_IDS.has(section.id),
    );

    setPrioritySectionsLoaded(false);

    if (options.reset) {
      setSections(sectionsToLoad);
    }

    const loadedPrioritySections = await Promise.all(
      prioritySections.map((section) => fetchSectionData(section)),
    );

    if (loadRunRef.current !== loadRun) return;

    setSections((currentSections) =>
      mergeLoadedSections(currentSections, loadedPrioritySections),
    );
    setPrioritySectionsLoaded(true);

    const loadedRemainingSections = await Promise.all(
      remainingSections.map((section) => fetchSectionData(section)),
    );

    if (loadRunRef.current !== loadRun) return;

    setSections((currentSections) =>
      mergeLoadedSections(currentSections, loadedRemainingSections),
    );
  }, []);

  useEffect(() => {
    if (genresLoading || !randomGenre || hasStartedInitialLoadRef.current) return;

    hasStartedInitialLoadRef.current = true;
    loadStagedSections(initialSections, { reset: true });
  }, [genresLoading, initialSections, loadStagedSections, randomGenre]);

  const discoverReady =
    prioritySectionsLoaded &&
    !authState.loading &&
    !genresLoading &&
    (!authState.authenticated || (hasLoadedViews && !viewsLoading));

  useEffect(() => {
    if (!discoverReady || hasHiddenSplashRef.current) return;

    hasHiddenSplashRef.current = true;
    SplashScreen.hideAsync().catch((error) => {
      console.error("Error hiding splash screen:", error);
    });
  }, [discoverReady]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStagedSections(initialSections);
    setRefreshing(false);
  };

  return (
    <View style={styles.wrapper}>
      <ProfileHeaderButton />
      <AnimatedHeader
        title={i18n.t("screen.discover.title")}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PlatformColor("label")}
          />
        }
      >
        {sections.map((section) => {
          if (section.loading && section.data.length === 0) {
            return null;
          }

          // Featured movie section - render single card with full size
          if (section.isFeatured && section.data.length > 0) {
            return (
              <View key={section.id} style={styles.featuredSection}>
                <Text
                  style={[
                    styles.featuredTitle,
                    { color: PlatformColor("label") },
                  ]}
                >
                  {section.title}
                </Text>
                <MediaCard
                  data={section.data[0]}
                  mediaType={section.mediaType}
                  size="xl"
                />
              </View>
            );
          }

          // Regular section - horizontal list
          return (
            <DiscoverSection
              key={section.id}
              title={section.title}
              data={section.data}
              mediaType={section.mediaType}
              queryPath={section.queryPath}
              loading={section.loading}
              cardSize={section.cardSize}
            />
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 4,
  },
  content: {
    paddingHorizontal: 2,
  },
  featuredSection: {
    marginBottom: 32,
    paddingHorizontal: 14,
  },
  featuredTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    marginBottom: 16,
  },
});
