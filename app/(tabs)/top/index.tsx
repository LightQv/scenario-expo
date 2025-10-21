import {
  StyleSheet,
  View,
  FlatList,
  PlatformColor,
  RefreshControl,
  ListRenderItem,
  Animated,
  Platform,
} from "react-native";
import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import HeaderTitle from "@/components/ui/HeaderTitle";
import { useGenreContext } from "@/contexts/GenreContext";
import MediaCard from "@/components/discover/MediaCard";
import TabSelector from "@/components/ui/TabSelector";
import GenreFilter from "@/components/ui/GenreFilter";
import SortFilter, { SortOption } from "@/components/ui/SortFilter";

// Create Animated FlatList for native scroll events
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<TmdbData>);

type MediaType = "movie" | "tv";

type FetchParams = {
  type: MediaType;
  genre: number | null;
  sort: string;
  page: number;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "vote_average.desc", label: "Rating ↓" },
  { value: "vote_average.asc", label: "Rating ↑" },
  { value: "popularity.desc", label: "Popularity ↓" },
  { value: "popularity.asc", label: "Popularity ↑" },
  { value: "primary_release_date.desc", label: "Release Date ↓" },
  { value: "primary_release_date.asc", label: "Release Date ↑" },
  { value: "title.desc", label: "Title (Z-A)" },
  { value: "title.asc", label: "Title (A-Z)" },
  { value: "revenue.desc", label: "Revenue ↓" },
  { value: "revenue.asc", label: "Revenue ↑" },
];

export default function TopIndexScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { movieGenres, tvGenres } = useGenreContext();
  const [fetchParams, setFetchParams] = useState<FetchParams>({
    type: "movie",
    genre: null,
    sort: "vote_average.desc",
    page: 1,
  });
  const [data, setData] = useState<TmdbData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  const flatListRef = useRef<FlatList<TmdbData>>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Get genres based on active media type
  const activeGenres =
    fetchParams.type === "movie" ? movieGenres || [] : tvGenres || [];

  // Sort genres alphabetically
  const sortedGenres = useMemo(
    () => [...activeGenres].sort((a, b) => a.name.localeCompare(b.name)),
    [activeGenres]
  );

  // Handle genre change
  const handleGenreChange = useCallback((genreId: number | null) => {
    setFetchParams((prev) => ({
      ...prev,
      genre: genreId,
      page: 1,
    }));
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sort: string) => {
    setFetchParams((prev) => ({
      ...prev,
      sort,
      page: 1,
    }));
  }, []);

  // Configure header with filters in headerRight
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <SortFilter
            sortOptions={SORT_OPTIONS}
            selectedSort={fetchParams.sort}
            onSortChange={handleSortChange}
          />
          <GenreFilter
            genres={sortedGenres}
            selectedGenreId={fetchParams.genre}
            onGenreChange={handleGenreChange}
          />
        </View>
      ),
    });
  }, [navigation, fetchParams.sort, fetchParams.genre, sortedGenres, handleSortChange, handleGenreChange]);

  // Fetch data from TMDB
  const fetchData = async (params: FetchParams, append: boolean = false) => {
    try {
      setLoading(true);

      const genreParam = params.genre ? `&with_genres=${params.genre}` : "";
      const endpoint = `/discover/${params.type}?language=${i18n.locale}&page=${params.page}&sort_by=${params.sort}&vote_count.gte=500${genreParam}`;

      const response = await tmdbFetch(endpoint);

      if (append) {
        setData((prev) => [...prev, ...response.results]);
      } else {
        setData(response.results);
        // Scroll to top when filters change
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }

      setTotalPages(response.total_pages);
    } catch (error) {
      console.error("Error fetching top data:", error);
      notifyError(i18n.t("toast.errorTMDB"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchData(fetchParams);
  }, [fetchParams.type, fetchParams.genre, fetchParams.sort, i18n.locale]);

  // Load next page
  useEffect(() => {
    if (fetchParams.page > 1) {
      fetchData(fetchParams, true);
    }
  }, [fetchParams.page]);

  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    const newType = tab.toLowerCase() as MediaType;
    setFetchParams({
      type: newType,
      genre: null, // Reset genre when changing media type
      sort: "vote_average.desc",
      page: 1,
    });
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData({ ...fetchParams, page: 1 });
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && fetchParams.page < totalPages) {
      setFetchParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  // Render media card
  const renderItem: ListRenderItem<TmdbData> = ({ item }) => (
    <MediaCard data={item} mediaType={fetchParams.type} size="grid" />
  );

  // Render header with title and sticky tabs
  const renderListHeader = useMemo(
    () => (
      <View>
        <HeaderTitle title="Top" />
        {/* Sticky Tabs */}
        <TabSelector
          tabs={["Movie", "TV"]}
          activeTab={fetchParams.type === "movie" ? "Movie" : "TV"}
          onTabChange={handleTabChange}
        />
      </View>
    ),
    [fetchParams.type, handleTabChange]
  );

  // Scroll handler
  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <AnimatedFlatList
        ref={flatListRef}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PlatformColor("label")}
          />
        }
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: Platform.select({
            android: 100 + insets.bottom,
            default: 20,
          }),
        }}
        contentInsetAdjustmentBehavior="automatic"
        scrollToOverflowEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        stickyHeaderIndices={[0]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
    marginRight: 8,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 16,
  },
});
