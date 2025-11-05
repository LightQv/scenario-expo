import {
  StyleSheet,
  View,
  FlatList,
  PlatformColor,
  RefreshControl,
  ListRenderItem,
  Platform,
  Animated,
  Text,
} from "react-native";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, Redirect, useFocusEffect } from "expo-router";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import AnimatedHeader from "@/components/ui/AnimatedHeader";
import { useUserContext } from "@/contexts/UserContext";
import WatchlistCard from "@/components/watchlist/WatchlistCard";
import WatchlistMenu from "@/components/watchlist/WatchlistMenu";
import WatchlistCreateButton from "@/components/watchlist/WatchlistCreateButton";

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "count_asc"
  | "count_desc";

export default function WatchlistIndexScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, authState } = useUserContext();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [sortedWatchlists, setSortedWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortType, setSortType] = useState<SortType>("title_asc");

  const flatListRef = useRef<FlatList<Watchlist>>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Redirect if not authenticated
  if (!authState.loading && !authState.authenticated) {
    return <Redirect href="/(modal)/login" />;
  }

  // Configure header with menu in headerRight
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <WatchlistCreateButton />
          <WatchlistMenu sortType={sortType} onSortChange={setSortType} />
        </View>
      ),
    });
  }, [navigation, sortType]);

  // Fetch watchlists from API
  const fetchWatchlists = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await apiFetch(`/api/v1/watchlists/${user.id}`);
      setWatchlists(response);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sort watchlists based on sortType, with SYSTEM type always first
  useEffect(() => {
    const sorted = [...watchlists].sort((a, b) => {
      // Always prioritize SYSTEM watchlist first
      if (a.type === "SYSTEM" && b.type !== "SYSTEM") return -1;
      if (a.type !== "SYSTEM" && b.type === "SYSTEM") return 1;

      // Then apply user's sort preference
      switch (sortType) {
        case "default":
          return 0; // Keep original API order
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "count_asc":
          return a.medias_count - b.medias_count;
        case "count_desc":
          return b.medias_count - a.medias_count;
        default:
          return 0;
      }
    });
    setSortedWatchlists(sorted);
  }, [watchlists, sortType]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      fetchWatchlists();
    }
  }, [user?.id]);

  // Refresh when screen comes into focus (e.g., after creating a watchlist)
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchWatchlists();
      }
    }, [user?.id]),
  );

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlists();
  };

  // Render watchlist card
  const renderItem: ListRenderItem<Watchlist> = ({ item }) => (
    <WatchlistCard data={item} />
  );

  // Empty state
  const renderEmpty = () => {
    if (loading || authState.loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
        >
          {i18n.t("screen.watchlist.empty")}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <AnimatedHeader
        title={i18n.t("screen.watchlist.title")}
        scrollY={scrollY}
      />

      <Animated.FlatList
        ref={flatListRef}
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PlatformColor("label")}
          />
        }
        contentContainerStyle={{
          paddingTop: TOKENS.margin.horizontal,
          paddingBottom: Platform.select({
            android: 100 + insets.bottom,
            default: 20,
          }),
        }}
        contentInsetAdjustmentBehavior="automatic"
        data={sortedWatchlists}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 22,
    marginHorizontal: 8,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
