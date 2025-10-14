import {
  StyleSheet,
  ScrollView,
  PlatformColor,
  RefreshControl,
  Text,
} from "react-native";
import { useState, useEffect } from "react";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DiscoverSection from "@/components/discover/DiscoverSection";
import { notifyError } from "@/components/toasts/Toast";

type SectionData = {
  id: string;
  title: string;
  data: TmdbData[];
  mediaType: string;
  queryPath: string;
  loading: boolean;
};

export default function DiscoverIndexScreen() {
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<SectionData[]>([
    {
      id: "tv-upcoming",
      title: "Today's TV Shows",
      data: [],
      mediaType: "tv",
      queryPath: "tv/airing_today",
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
    {
      id: "popular-movies",
      title: "Popular Movies",
      data: [],
      mediaType: "movie",
      queryPath: "movie/popular",
      loading: true,
    },
    {
      id: "trending-week",
      title: "Trending week",
      data: [],
      mediaType: "all",
      queryPath: "trending/all/week",
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
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const fetchSectionData = async (section: SectionData) => {
    try {
      let endpoint = `/${section.queryPath}?language=${i18n.locale}&page=1`;

      // Paramètres spéciaux pour certaines sections
      if (section.id === "movies-2000s") {
        endpoint +=
          "&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31&sort_by=vote_average.desc&vote_count.gte=1000";
      }

      const response = await tmdbFetch(endpoint);

      return {
        ...section,
        data: response.results.slice(0, 10),
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
    console.log(results);
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
        <Text
          style={[
            styles.title,
            { marginTop: -insets.top - 10, color: PlatformColor("label") },
          ]}
        >
          Discover
        </Text>
        {sections.map((section) => (
          <DiscoverSection
            key={section.id}
            title={section.title}
            data={section.data}
            mediaType={section.mediaType}
            queryPath={section.queryPath}
            loading={section.loading}
          />
        ))}
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
    fontWeight: "bold",
    marginBottom: 24,
    paddingHorizontal: 14,
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: 2,
  },
});
