import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  PlatformColor,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import DiscoverSection from "@/components/discover/DiscoverSection";
import MediaCard from "@/components/discover/MediaCard";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS } from "@/constants/theme";
import HeaderTitle from "@/components/ui/HeaderTitle";

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
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: "trending-week",
      title: "Trending this week",
      data: [],
      mediaType: "all",
      queryPath: "trending/all/week",
      loading: true,
      cardSize: "md",
    },
    {
      id: "highly-rated-movies",
      title: "Highly rated movies",
      data: [],
      mediaType: "movie",
      queryPath: "discover/movie",
      loading: true,
    },
    {
      id: "tv-upcoming",
      title: "Running TV Shows",
      data: [],
      mediaType: "tv",
      queryPath: "tv/on_the_air",
      loading: true,
    },
    {
      id: "featured-movie",
      title: "Featured Movie",
      data: [],
      mediaType: "movie",
      queryPath: "discover/movie",
      loading: true,
      isFeatured: true,
    },
    {
      id: "popular-movies",
      title: "Popular Movies",
      data: [],
      mediaType: "movie",
      queryPath: "movie/popular",
      loading: true,
    },
    {
      id: "top-rated-tv",
      title: "Best rated TV Shows",
      data: [],
      mediaType: "tv",
      queryPath: "tv/top_rated",
      loading: true,
    },
    {
      id: "top-rated-japanimation",
      title: "Best rated Japanese anime",
      data: [],
      mediaType: "tv",
      queryPath: "discover/tv",
      loading: true,
    },
    {
      id: "movies-2000s",
      title: "Best 2000s movies",
      data: [],
      mediaType: "movie",
      queryPath: "discover/movie",
      loading: true,
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const fetchSectionData = async (section: SectionData) => {
    try {
      let endpoint = `/${section.queryPath}?language=${i18n.locale}&page=1`;

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

  const loadAllSections = async () => {
    const promises = sections.map((section) => fetchSectionData(section));
    const results = await Promise.all(promises);
    setSections(results);
  };

  useEffect(() => {
    loadAllSections();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllSections();
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
        <HeaderTitle title="Discover" />

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
