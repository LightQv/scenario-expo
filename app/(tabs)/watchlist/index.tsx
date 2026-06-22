import {
  Dimensions,
  StyleSheet,
  View,
  FlatList,
  PlatformColor,
  RefreshControl,
  ListRenderItem,
  Platform,
  Animated,
} from "react-native";
import { ContentUnavailableView, Host } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Redirect, useFocusEffect } from "expo-router";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { TOKENS } from "@/constants/theme";
import AnimatedHeader from "@/components/ui/AnimatedHeader";
import { useUserContext } from "@/contexts/UserContext";
import WatchlistCard from "@/components/watchlist/WatchlistCard";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "count_asc"
  | "count_desc";

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "default", label: i18n.t("screen.watchlist.sort.default") },
  { value: "title_asc", label: i18n.t("screen.watchlist.sort.titleAsc") },
  { value: "title_desc", label: i18n.t("screen.watchlist.sort.titleDesc") },
  { value: "count_asc", label: i18n.t("screen.watchlist.sort.itemsAsc") },
  { value: "count_desc", label: i18n.t("screen.watchlist.sort.itemsDesc") },
];

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CONTENT_TOP_PADDING = TOKENS.margin.horizontal - 12;
const WATCHLIST_HEADER_BLOCK_HEIGHT = 120;

export default function WatchlistIndexScreen() {
  const insets = useSafeAreaInsets();
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
    const emptyStateHeight = Math.max(
      260,
      SCREEN_HEIGHT -
        CONTENT_TOP_PADDING -
        WATCHLIST_HEADER_BLOCK_HEIGHT -
        insets.bottom,
    );

    return (
      <Host style={[styles.emptyContainer, { height: emptyStateHeight }]}>
        <ContentUnavailableView
          systemImage="list.bullet.rectangle.portrait"
          title={i18n.t("screen.watchlist.emptyState.title")}
          description={i18n.t("screen.watchlist.emptyState.body")}
        />
      </Host>
    );
  };

  return (
    <View style={styles.wrapper}>
      <HeaderActionCapsule
        actions={[
          {
            id: "create",
            label: i18n.t("form.watchlist.create.title"),
            icon: "plus",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/(modal)/watchlist-create");
            },
          },
          {
            id: "sort",
            label: i18n.t("screen.watchlist.menu.sort"),
            icon: "arrow.up.arrow.down",
            menu: SORT_OPTIONS.map((option) => ({
              id: option.value,
              title: option.label,
              selected: sortType === option.value,
              onPress: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSortType(option.value);
              },
            })),
          },
        ]}
      />
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
          paddingTop: CONTENT_TOP_PADDING,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
  },
});
