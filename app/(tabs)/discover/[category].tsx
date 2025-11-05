import {
  View,
  StyleSheet,
  Text,
  FlatList,
  PlatformColor,
  ActivityIndicator,
} from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { FONTS, TOKENS } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MediaCard from "@/components/discover/MediaCard";
import PersonCard from "@/components/discover/PersonCard";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext } from "@/contexts/ThemeContext";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

export default function CategoryDetailScreen() {
  const { colors, isDark } = useThemeContext();
  const insets = useSafeAreaInsets();
  const { category, mediaType, title } = useLocalSearchParams<{
    category: string;
    mediaType: string;
    title: string;
  }>();

  const [data, setData] = useState<TmdbData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();

  // Build the endpoint with special parameters
  const buildEndpoint = (pageNumber: number) => {
    let endpoint = `/${category}?language=${i18n.locale}&page=${pageNumber}`;

    // Apply special parameters based on category
    if (category.includes("discover/movie")) {
      // Check if it's the 2000s movies or highly rated movies
      if (title?.includes("2000")) {
        endpoint +=
          "&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31&sort_by=vote_average.desc&vote_count.gte=1000";
      } else if (title?.includes("rated")) {
        endpoint +=
          "&vote_average.gte=6&sort_by=vote_average.desc&vote_count.gte=500";
      }
    }

    if (category.includes("discover/tv")) {
      // Check if it's Japanese anime
      if (title?.includes("anime") || title?.includes("Japanese")) {
        endpoint +=
          "&with_genres=16&with_origin_country=JP&with_origin_language=ja&sort_by=vote_average.desc&vote_count.gte=500";
      }
    }

    return endpoint;
  };

  // Fetch initial data
  const fetchData = async () => {
    if (!category) return;

    try {
      setLoading(true);
      const endpoint = buildEndpoint(1);
      const response = await tmdbFetch(endpoint);
      setData(response.results);
      setPage(1);
      setHasMore(response.page < response.total_pages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching category data:", error);
      notifyError(i18n.t("toast.errorTMDB"));
      setLoading(false);
    }
  };

  // Fetch more data for infinite scroll
  const fetchMoreData = async () => {
    if (!hasMore || loadingMore || !category) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const endpoint = buildEndpoint(nextPage);
      const response = await tmdbFetch(endpoint);
      setData((prevData) => [...prevData, ...response.results]);
      setPage(nextPage);
      setHasMore(response.page < response.total_pages);
      setLoadingMore(false);
    } catch (error) {
      console.error("Error fetching more data:", error);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: title || "Discover",
      headerTintColor: colors.text,
      headerLeft: () => <GoBackButton />,
    });
  }, [navigation, colors.text, title]);

  const statusStyle = isDark ? "light" : "dark";

  // Render item in 2-column grid
  const renderItem = ({ item }: { item: TmdbData }) => {
    // Render PersonCard for person mediaType, otherwise MediaCard
    if (mediaType === "person") {
      return <PersonCard data={item} size="grid" />;
    }
    return <MediaCard data={item} mediaType={mediaType} size="grid" />;
  };

  // Render footer with loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={PlatformColor("label")} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return <FullScreenLoader />;
    }
    return (
      <View style={styles.centerContainer}>
        <Text
          style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
        >
          {i18n.t("toast.errorQuery")}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <StatusBar style={statusStyle} animated />

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 60 },
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 24,
  },
  row: {
    gap: 14, // Same gap as DiscoverSection horizontal lists
    marginBottom: 20,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
});
