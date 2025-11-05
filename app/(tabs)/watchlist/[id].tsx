import {
  View,
  StyleSheet,
  PlatformColor,
  FlatList,
  useColorScheme,
  ListRenderItem,
  Text,
} from "react-native";
import { useEffect, useLayoutEffect, useState, useCallback, memo } from "react";
import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import WatchlistDetailBanner from "@/components/watchlist/WatchlistDetailBanner";
import WatchlistDetailHeader from "@/components/watchlist/WatchlistDetailHeader";
import GradientTransition from "@/components/details/GradientTransition";
import WatchlistMediaCard from "@/components/watchlist/WatchlistMediaCard";
import WatchlistDetailMenu from "@/components/watchlist/WatchlistDetailMenu";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import GoBackButton from "@/components/ui/GoBackButton";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<APIMedia>);

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "date_asc"
  | "date_desc";
type FilterType = "all" | "movie" | "tv";

// Memoize the media card component
const MemoizedWatchlistMediaCard = memo(WatchlistMediaCard);

// Memoize the list header
const ListHeader = memo(
  ({ watchlist, scrollY }: { watchlist: Watchlist; scrollY: any }) => (
    <View>
      <WatchlistDetailBanner medias={watchlist.medias} scrollY={scrollY} />
      <WatchlistDetailHeader
        title={watchlist.title}
        mediaCount={watchlist.medias_count}
      />
      <GradientTransition />
    </View>
  ),
);

ListHeader.displayName = "ListHeader";

export default function WatchlistDetailScreen() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [watchlist, setWatchlist] = useState<Watchlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>("title_asc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const navigation = useNavigation();

  // Shared value for scroll offset
  const scrollY = useSharedValue(0);

  // Fetch watchlist detail
  const fetchWatchlistDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiFetch(`/api/v1/watchlists/detail/${id}`);
      setWatchlist(response);
    } catch (error) {
      console.error("Error fetching watchlist detail:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    if (id) {
      fetchWatchlistDetail();
    }
  }, [id, fetchWatchlistDetail]);

  // Refresh when screen comes into focus (e.g., after editing watchlist)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchWatchlistDetail();
      }
    }, [id, fetchWatchlistDetail]),
  );

  // Status bar - always light (over the image)
  const statusStyle = colorScheme === "dark" ? "light" : "dark";

  // Optimized scroll handler using worklet
  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        "worklet";
        scrollY.value = event.contentOffset.y;
      },
    },
    [],
  );

  // Handle watchlist deletion
  const handleDelete = useCallback(() => {
    // Navigation back is handled in the menu component
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sort: SortType) => {
    setSortType(sort);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((filter: FilterType) => {
    setFilterType(filter);
  }, []);

  // Get filtered and sorted media list - memoized
  const processedMedias = useCallback((): APIMedia[] => {
    if (!watchlist?.medias) return [];

    let medias = [...watchlist.medias];

    // Apply filter
    if (filterType !== "all") {
      medias = medias.filter((media) => media.media_type === filterType);
    }

    // Apply sort
    switch (sortType) {
      case "title_asc":
        medias.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title_desc":
        medias.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "date_asc":
        medias.sort((a, b) => {
          const dateA = new Date(a.release_date || "").getTime();
          const dateB = new Date(b.release_date || "").getTime();
          return dateA - dateB;
        });
        break;
      case "date_desc":
        medias.sort((a, b) => {
          const dateA = new Date(a.release_date || "").getTime();
          const dateB = new Date(b.release_date || "").getTime();
          return dateB - dateA;
        });
        break;
      case "default":
      default:
        // Keep original order (by added_at timestamp from backend)
        break;
    }

    return medias;
  }, [watchlist?.medias, filterType, sortType]);

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerLeft: () => <GoBackButton />,
      headerRight: () =>
        watchlist ? (
          <WatchlistDetailMenu
            watchlistId={id}
            watchlistType={watchlist.type}
            sortType={sortType}
            filterType={filterType}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onDelete={handleDelete}
          />
        ) : null,
    });
  }, [
    navigation,
    watchlist,
    id,
    sortType,
    filterType,
    handleSortChange,
    handleFilterChange,
    handleDelete,
  ]);

  // Render media card with useCallback
  const renderItem: ListRenderItem<APIMedia> = useCallback(
    ({ item }) => (
      <MemoizedWatchlistMediaCard
        data={item}
        watchlistId={id}
        watchlistType={watchlist?.type}
        onDelete={fetchWatchlistDetail}
      />
    ),
    [id, watchlist?.type, fetchWatchlistDetail],
  );

  // Empty state
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
        >
          {i18n.t("screen.watchlist.detail.empty")}
        </Text>
      </View>
    );
  }, [loading]);

  // List header with banner and title
  const renderListHeader = useCallback(() => {
    if (!watchlist) return null;
    return <ListHeader watchlist={watchlist} scrollY={scrollY} />;
  }, [watchlist, scrollY]);

  // Item separator for list
  const renderItemSeparator = useCallback(
    () => (
      <View
        style={{
          height: 2,
          backgroundColor: PlatformColor("systemBackground"),
        }}
      />
    ),
    [],
  );

  // Key extractor
  const keyExtractor = useCallback((item: APIMedia) => item.id.toString(), []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <StatusBar style={statusStyle} animated />

      <AnimatedFlatList
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        data={processedMedias()}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderItemSeparator}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: PlatformColor("systemBackground"),
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
