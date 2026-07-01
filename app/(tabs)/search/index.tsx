import {
  Animated,
  Easing,
  Keyboard,
  PlatformColor,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGenreContext } from "@/contexts/GenreContext";
import { useSearchContext } from "./_layout";
import GenreCard from "@/components/search/GenreCard";
import SearchHistory from "@/components/search/SearchHistory";
import MediaTypePicker from "@/components/search/MediaTypePicker";
import SearchPreviewResults from "@/components/search/SearchPreviewResults";
import {
  getSearchHistory,
  clearSearchHistory,
  type SearchHistoryItem,
} from "@/services/searchHistory";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { BUTTON, FONTS, TOKENS } from "@/constants/theme";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

type MediaType = "movie" | "tv" | "person";
type ContentMode = "genres" | "search";

const PREVIEW_LIMIT = 10;
const SEARCH_BAR_HEIGHT = 42;
const CLOSE_BUTTON_SIZE = 42;
const DEFAULT_HEADER_HEIGHT = 94;
const ACTIVE_HEADER_HEIGHT = 90;
const HEADER_ANIMATION_DURATION = 340;
const CONTENT_TOP_GAP = 16;
const HEADER_ANIMATION_EASING = Easing.inOut(Easing.cubic);

export default function SearchScreen() {
  const { totalGenres, loading } = useGenreContext();
  const { mediaType, setMediaType, setSearch } = useSearchContext();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(false);
  const [contentMode, setContentMode] = useState<ContentMode>("genres");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [previewResults, setPreviewResults] = useState<TmdbData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const genreScrollY = useRef(new Animated.Value(0)).current;
  const activeScrollY = useRef(new Animated.Value(0)).current;
  const requestIdRef = useRef(0);
  const inputRef = useRef<TextInput>(null);

  const defaultHeaderHeight =
    insets.top + DEFAULT_HEADER_HEIGHT + CONTENT_TOP_GAP;
  const activeHeaderHeight =
    insets.top + ACTIVE_HEADER_HEIGHT + CONTENT_TOP_GAP;
  const genreOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const genreTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const searchOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const searchTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  useFocusEffect(
    useCallback(() => {
      loadHistory();

      return () => {
        inputRef.current?.blur();
        Keyboard.dismiss();
      };
    }, []),
  );

  const runSearchAnimation = useCallback(
    (toValue: number, onComplete?: () => void) => {
      animation.stopAnimation();
      Animated.timing(animation, {
        toValue,
        duration: HEADER_ANIMATION_DURATION,
        easing: HEADER_ANIMATION_EASING,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          onComplete?.();
        }
      });
    },
    [animation],
  );

  useEffect(() => {
    return () => {
      animation.stopAnimation();
    };
  }, [animation]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (contentMode !== "search" || !trimmedQuery) {
      setPreviewResults([]);
      setPreviewLoading(false);
      return;
    }

    if (!active) {
      return;
    }

    setPreviewLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        const endpoint =
          mediaType === "person"
            ? `/search/person?query=${encodedQuery}&language=${i18n.locale}&page=1`
            : `/search/${mediaType}?query=${encodedQuery}&include_adult=false&language=${i18n.locale}&page=1`;
        const response = await tmdbFetch(endpoint);

        if (requestIdRef.current === requestId) {
          setPreviewResults(response.results.slice(0, PREVIEW_LIMIT));
        }
      } catch (error) {
        if (requestIdRef.current === requestId) {
          notifyError(i18n.t("toast.errorTMDB"));
          setPreviewResults([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setPreviewLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [active, contentMode, query, mediaType]);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    setContentMode("search");
    setActive(true);
    activeScrollY.setValue(0);
    setQuery(item.query);
    setSearch(item.query);
    setMediaType(item.type);
    inputRef.current?.focus();
    runSearchAnimation(1);
  };

  const handleFocusSearch = () => {
    setContentMode("search");
    setActive(true);
    activeScrollY.setValue(0);
    runSearchAnimation(1);
  };

  const handleCloseSearch = () => {
    setActive(false);
    Keyboard.dismiss();

    runSearchAnimation(0, () => {
      setContentMode("genres");
      activeScrollY.setValue(0);
      setQuery("");
      setSearch("");
      setPreviewResults([]);
      setPreviewLoading(false);
    });
  };

  const handleShowAllResults = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearch(trimmedQuery);
    router.push("/(tabs)/search/query");
  };

  const handleMediaTypeChange = (type: MediaType) => {
    setMediaType(type);
  };

  const handleNavigateAway = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  const renderGenreItem = ({
    item,
  }: {
    item: { id: number; name: string };
  }) => <GenreCard id={item.id} name={item.name} />;

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        active={active}
        animation={animation}
        genreScrollY={genreScrollY}
        activeScrollY={activeScrollY}
        contentTop={insets.top}
        query={query}
        inputRef={inputRef}
        mediaType={mediaType}
        onFocus={handleFocusSearch}
        onChangeText={setQuery}
        onSubmit={handleShowAllResults}
        onClose={handleCloseSearch}
        onMediaTypeChange={handleMediaTypeChange}
      />

      <Animated.View
        style={[
          styles.contentLayer,
          {
            opacity: genreOpacity,
            transform: [{ translateY: genreTranslateY }],
          },
        ]}
        pointerEvents={contentMode === "genres" ? "auto" : "none"}
      >
        <Animated.FlatList
          data={totalGenres}
          renderItem={renderGenreItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.genreRow}
          contentContainerStyle={[
            styles.genreContent,
            { paddingTop: defaultHeaderHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: genreScrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentLayer,
          {
            opacity: searchOpacity,
            transform: [{ translateY: searchTranslateY }],
          },
        ]}
        pointerEvents={contentMode === "search" && active ? "auto" : "none"}
      >
        {query.trim() ? (
          <View
            style={[
              styles.activeContent,
              { paddingTop: activeHeaderHeight },
            ]}
          >
            <SearchPreviewResults
              results={previewResults}
              mediaType={mediaType}
              loading={previewLoading}
              query={query.trim()}
              onShowAll={handleShowAllResults}
              onNavigateAway={handleNavigateAway}
              scrollY={activeScrollY}
            />
          </View>
        ) : (
          <View
            style={[
              styles.activeContent,
              { paddingTop: activeHeaderHeight },
            ]}
          >
            <SearchHistory
              history={history}
              onItemPress={handleHistoryItemPress}
              onClearHistory={handleClearHistory}
              scrollY={activeScrollY}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

type SearchHeaderProps = {
  active: boolean;
  animation: Animated.Value;
  genreScrollY: Animated.Value;
  activeScrollY: Animated.Value;
  contentTop: number;
  query: string;
  inputRef: RefObject<TextInput | null>;
  mediaType: MediaType;
  onFocus: () => void;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onMediaTypeChange: (type: MediaType) => void;
};

function SearchHeader({
  active,
  animation,
  genreScrollY,
  activeScrollY,
  contentTop,
  query,
  inputRef,
  mediaType,
  onFocus,
  onChangeText,
  onSubmit,
  onClose,
  onMediaTypeChange,
}: SearchHeaderProps) {
  const titleOpacity = animation.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 0.15, 0],
  });
  const titleTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const searchTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -42],
  });
  const closeOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const closeScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });
  const closeWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, CLOSE_BUTTON_SIZE],
  });
  const closeMarginLeft = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });
  const pickerOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const pickerTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });
  const headerBackdropHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [
      contentTop + DEFAULT_HEADER_HEIGHT + CONTENT_TOP_GAP,
      contentTop + ACTIVE_HEADER_HEIGHT + CONTENT_TOP_GAP,
    ],
  });
  const genreBackdropOpacity = genreScrollY.interpolate({
    inputRange: [0, 10, 32],
    outputRange: [0, 0.35, 1],
    extrapolate: "clamp",
  });
  const activeBackdropOpacity = activeScrollY.interpolate({
    inputRange: [0, 10, 32],
    outputRange: [0, 0.35, 1],
    extrapolate: "clamp",
  });
  const inactiveHeaderOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const headerBackdropOpacity = Animated.add(
    Animated.multiply(genreBackdropOpacity, inactiveHeaderOpacity),
    Animated.multiply(activeBackdropOpacity, animation),
  );

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: contentTop + 2,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.headerBackdrop,
          { height: headerBackdropHeight, opacity: headerBackdropOpacity },
        ]}
      >
        <BlurView
          intensity={80}
          tint="systemChromeMaterial"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerTint} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.headerTitle,
          {
            color: PlatformColor("label"),
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        {i18n.t("screen.search.title")}
      </Animated.Text>

      <Animated.View
        style={[
          styles.searchSection,
          { transform: [{ translateY: searchTranslateY }] },
        ]}
      >
        <View style={styles.searchRow}>
          <View style={[styles.controlChrome, styles.searchInputChrome]}>
            <GlassView style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={PlatformColor("label")} />
              <TextInput
                ref={inputRef}
                value={query}
                onFocus={onFocus}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                placeholder={i18n.t("screen.search.placeholder")}
                placeholderTextColor={PlatformColor("secondaryLabel") as never}
                returnKeyType="search"
                autoCorrect={false}
                clearButtonMode="while-editing"
                style={[styles.searchInput, { color: PlatformColor("label") }]}
              />
            </GlassView>
          </View>

          <Animated.View
            style={[
              styles.closeContainer,
              {
                width: closeWidth,
                marginLeft: closeMarginLeft,
                opacity: closeOpacity,
                transform: [{ scale: closeScale }],
              },
            ]}
            pointerEvents={active ? "auto" : "none"}
          >
            <TouchableOpacity
              activeOpacity={BUTTON.opacity}
              onPress={onClose}
              style={styles.closeButtonWrapper}
            >
              <View style={[styles.controlChrome, styles.closeButtonChrome]}>
                <GlassView style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={PlatformColor("label")}
                  />
                </GlassView>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.pickerContainer,
            {
              opacity: pickerOpacity,
              transform: [{ translateY: pickerTranslateY }],
            },
          ]}
          pointerEvents={active ? "auto" : "none"}
        >
          <MediaTypePicker
            selectedType={mediaType}
            onTypeChange={onMediaTypeChange}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 8,
  },
  headerBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    overflow: "hidden",
  },
  headerTint: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: PlatformColor("systemBackground"),
    opacity: 0.1,
  },
  headerTitle: {
    fontFamily: FONTS.abril,
    fontSize: 38,
    marginTop: -8,
  },
  searchSection: {
    gap: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlChrome: {
    borderRadius: TOKENS.radius.full,
    backgroundColor: PlatformColor("systemFill"),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
    overflow: "hidden",
  },
  searchInputChrome: {
    flex: 1,
    height: SEARCH_BAR_HEIGHT,
  },
  searchInputContainer: {
    width: "100%",
    height: SEARCH_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 13,
    paddingRight: 12,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  closeContainer: {
    overflow: "hidden",
    alignItems: "flex-end",
  },
  closeButtonWrapper: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: TOKENS.radius.full,
    overflow: "hidden",
  },
  closeButtonChrome: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerContainer: {
    height: SEARCH_BAR_HEIGHT,
  },
  genreRow: {
    justifyContent: "space-between",
  },
  contentLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  genreContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 86,
  },
  activeContent: {
    flex: 1,
  },
});
