import {
  View,
  StyleSheet,
  PlatformColor,
  FlatList,
  useColorScheme,
  ListRenderItem,
  Text,
} from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  useLocalSearchParams,
  useNavigation,
  useFocusEffect,
} from "expo-router";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import WatchlistCarouselBanner from "@/components/watchlist/WatchlistCarouselBanner";
import WatchlistDetailHeader from "@/components/watchlist/WatchlistDetailHeader";
import GradientTransition from "@/components/details/GradientTransition";
import WatchlistMediaCard from "@/components/watchlist/WatchlistMediaCard";
import WatchlistDetailMenu from "@/components/watchlist/WatchlistDetailMenu";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import GoBackButton from "@/components/ui/GoBackButton";
import { useCallback } from "react";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<APIMedia>);

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "date_asc"
  | "date_desc";
type FilterType = "all" | "movie" | "tv";

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
  const fetchWatchlistDetail = async () => {
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
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchWatchlistDetail();
    }
  }, [id]);

  // Refresh when screen comes into focus (e.g., after editing watchlist)
  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchWatchlistDetail();
      }
    }, [id]),
  );

  // Status bar - always light (over the image)
  const statusStyle = colorScheme === "dark" ? "light" : "dark";

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Handle watchlist deletion
  const handleDelete = () => {
    // Navigation back is handled in the menu component
  };

  // Handle sort change
  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
  };

  // Handle filter change
  const handleFilterChange = (filter: FilterType) => {
    setFilterType(filter);
  };

  // Get filtered and sorted media list
  const getProcessedMedias = (): APIMedia[] => {
    if (!watchlist?.medias) return [];

    let medias = [...watchlist.medias];

    // Apply filter
    if (filterType !== "all") {
      medias = medias.filter((media) => media.media_type === filterType);
    }

    // Apply sort
    switch (sortType) {
      case "title_asc":
        medias.sort((a, b) =>
          (a.title || a.name || "").localeCompare(b.title || b.name || ""),
        );
        break;
      case "title_desc":
        medias.sort((a, b) =>
          (b.title || b.name || "").localeCompare(a.title || a.name || ""),
        );
        break;
      case "date_asc":
        medias.sort((a, b) => {
          const dateA = new Date(
            a.release_date || a.first_air_date || "",
          ).getTime();
          const dateB = new Date(
            b.release_date || b.first_air_date || "",
          ).getTime();
          return dateA - dateB;
        });
        break;
      case "date_desc":
        medias.sort((a, b) => {
          const dateA = new Date(
            a.release_date || a.first_air_date || "",
          ).getTime();
          const dateB = new Date(
            b.release_date || b.first_air_date || "",
          ).getTime();
          return dateB - dateA;
        });
        break;
      case "default":
      default:
        // Keep original order (by added_at timestamp from backend)
        break;
    }

    return medias;
  };

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
            sortType={sortType}
            filterType={filterType}
            onSortChange={handleSortChange}
            onFilterChange={handleFilterChange}
            onDelete={handleDelete}
          />
        ) : null,
    });
  }, [navigation, watchlist, id, sortType, filterType]);

  // Render media card
  const renderItem: ListRenderItem<APIMedia> = ({ item }) => (
    <WatchlistMediaCard
      data={item}
      watchlistId={id}
      onDelete={fetchWatchlistDetail}
    />
  );

  // Empty state
  const renderEmpty = () => {
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
  };

  // List header with banner and title
  const renderListHeader = () => {
    if (!watchlist) return null;

    return (
      <View>
        <WatchlistCarouselBanner medias={watchlist.medias} scrollY={scrollY} />
        <WatchlistDetailHeader
          title={watchlist.title}
          mediaCount={watchlist.medias_count}
        />
        <GradientTransition />
      </View>
    );
  };

  // Item separator for list
  const renderItemSeparator = () => (
    <View
      style={{ height: 2, backgroundColor: PlatformColor("systemBackground") }}
    />
  );

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
        entering={FadeInLeft}
        exiting={FadeOutRight}
        data={getProcessedMedias()}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderListHeader()}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderItemSeparator}
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
