import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  PlatformColor,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import DiscoverSection from "@/components/discover/DiscoverSection";
import MediaCard from "@/components/discover/MediaCard";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS } from "@/constants/theme";
import HeaderTitle from "@/components/ui/HeaderTitle";
import { useGenreContext } from "@/contexts/GenreContext";

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

export default function DiscoverIndexScreen() {
  const { movieGenres } = useGenreContext();
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);

  // Select random genre on mount and refresh
  const randomGenre = useMemo(() => {
    if (!movieGenres || movieGenres.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * movieGenres.length);
    return movieGenres[randomIndex];
  }, [movieGenres, refreshing]); // Re-select on refresh

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
      if (section.id === "highly-rated-movies" || section.id === "featured-movie") {
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
        id: "featured-movie",
        title: i18n.t("screen.discover.sections.featuredMovie"),
        data: [],
        mediaType: "movie",
        queryPath: "discover/movie",
        loading: true,
        isFeatured: true,
      },
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

  const loadAllSections = async (sectionsToLoad: SectionData[]) => {
    const promises = sectionsToLoad.map((section) => fetchSectionData(section));
    const results = await Promise.all(promises);
    setSections(results);
  };

  useEffect(() => {
    loadAllSections(initialSections);
  }, [initialSections]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllSections(initialSections);
    setRefreshing(false);
  };

  return (
    <>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PlatformColor("label")}
          />
        }
      >
        <HeaderTitle title={i18n.t("screen.discover.title")} />

        {sections.map((section) => {
          // Featured movie section - render single card with full size
          if (section.isFeatured && section.data.length > 0) {
            return (
              <View key={section.id} style={styles.featuredSection}>
                <Text style={[styles.featuredTitle, { color: PlatformColor("label") }]}>
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
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 38,
    fontFamily: FONTS.abril,
    marginBottom: 24,
    paddingHorizontal: 14,
  },
  content: {
    paddingTop: 16,
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
