import {
  StyleSheet,
  ScrollView,
  PlatformColor,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import DiscoverSection from "@/components/discover/DiscoverSection";
import HeaderTitle from "@/components/ui/HeaderTitle";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

type SectionData = {
  id: string;
  title: string;
  data: TmdbData[];
  mediaType: string;
  queryPath: string;
  loading: boolean;
  cardSize?: "sm" | "md" | "xl";
};

export default function GenreResultsScreen() {
  const { genreId, genreName } = useLocalSearchParams<{
    genreId: string;
    genreName: string;
  }>();

  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSectionData = async (section: SectionData) => {
    try {
      const endpoint = `/${section.queryPath}&language=${i18n.locale}&page=1`;
      const response = await tmdbFetch(endpoint);
      const results = response.results.slice(0, 10);

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

  const initialSections = useMemo(() => {
    return [
      {
        id: "popular-movies-genre",
        title: i18n.t("screen.discover.sections.popularMovies"),
        data: [],
        mediaType: "movie",
        queryPath: `discover/movie?with_genres=${genreId}&sort_by=popularity.desc`,
        loading: true,
      },
      {
        id: "top-rated-movies-genre",
        title: i18n.t("screen.discover.sections.highlyRatedMovies"),
        data: [],
        mediaType: "movie",
        queryPath: `discover/movie?with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=500`,
        loading: true,
        cardSize: "md" as const,
      },
      {
        id: "recent-movies-genre",
        title: i18n.t("screen.discover.sections.nowPlayingMovies"),
        data: [],
        mediaType: "movie",
        queryPath: `discover/movie?with_genres=${genreId}&sort_by=primary_release_date.desc&primary_release_date.lte=${new Date().toISOString().split("T")[0]}`,
        loading: true,
      },
      {
        id: "popular-tv-genre",
        title: i18n.t("screen.discover.sections.popularTv"),
        data: [],
        mediaType: "tv",
        queryPath: `discover/tv?with_genres=${genreId}&sort_by=popularity.desc`,
        loading: true,
      },
      {
        id: "top-rated-tv-genre",
        title: `${i18n.t("screen.discover.sections.topRatedTv")}`,
        data: [],
        mediaType: "tv",
        queryPath: `discover/tv?with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=500`,
        loading: true,
      },
    ];
  }, [genreId]);

  const loadAllSections = async (sectionsToLoad: SectionData[]) => {
    const promises = sectionsToLoad.map((section) => fetchSectionData(section));
    const results = await Promise.all(promises);
    setSections(results);
    setLoading(false);
  };

  useEffect(() => {
    loadAllSections(initialSections);
  }, [initialSections]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllSections(initialSections);
    setRefreshing(false);
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
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
      <HeaderTitle title={genreName || "Genre"} />

      {sections
        .filter((section) => section.data.length > 0 || section.loading)
        .map((section) => (
          <DiscoverSection
            key={section.id}
            title={section.title}
            data={section.data}
            mediaType={section.mediaType}
            queryPath={section.queryPath}
            loading={section.loading}
            cardSize={section.cardSize}
          />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 190,
    paddingHorizontal: 2,
    paddingBottom: TOKENS.margin.vertical,
  },
});
