import {
  Animated,
  FlatList,
  Keyboard,
  PlatformColor,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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

const PREVIEW_LIMIT = 10;
const SEARCH_BAR_HEIGHT = 42;
const CLOSE_BUTTON_SIZE = 42;
const DEFAULT_HEADER_HEIGHT = 94;
const ACTIVE_HEADER_HEIGHT = 90;
const HEADER_ANIMATION_DURATION = 190;

export default function SearchScreen() {
  const { totalGenres, loading } = useGenreContext();
  const { mediaType, setMediaType, setSearch } = useSearchContext();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [previewResults, setPreviewResults] = useState<TmdbData[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const requestIdRef = useRef(0);
  const inputRef = useRef<TextInput>(null);

  const headerHeight =
    insets.top + (active ? ACTIVE_HEADER_HEIGHT : DEFAULT_HEADER_HEIGHT);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, []),
  );

  useEffect(() => {
    Animated.timing(animation, {
      toValue: active ? 1 : 0,
      duration: HEADER_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [active, animation]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!active || !trimmedQuery) {
      setPreviewResults([]);
      setPreviewLoading(false);
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
  }, [active, query, mediaType]);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = (item: SearchHistoryItem) => {
    setActive(true);
    setQuery(item.query);
    setSearch(item.query);
    setMediaType(item.type);
    inputRef.current?.focus();
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setActive(false);
    setSearch("");
    setPreviewResults([]);

    setTimeout(() => {
      setQuery("");
    }, HEADER_ANIMATION_DURATION);
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

  const renderGenreItem = ({ item }: { item: { id: number; name: string } }) => (
    <GenreCard id={item.id} name={item.name} />
  );

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        active={active}
        animation={animation}
        contentTop={insets.top}
        query={query}
        inputRef={inputRef}
        mediaType={mediaType}
        onFocus={() => setActive(true)}
        onChangeText={setQuery}
        onSubmit={handleShowAllResults}
        onClose={handleCloseSearch}
        onMediaTypeChange={handleMediaTypeChange}
      />

      {!active ? (
        <FlatList
          data={totalGenres}
          renderItem={renderGenreItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.genreRow}
          contentContainerStyle={[
            styles.genreContent,
            { paddingTop: headerHeight + 4 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
        />
      ) : query.trim() ? (
        <View style={[styles.activeContent, { paddingTop: headerHeight + 4 }]}>
          <SearchPreviewResults
            results={previewResults}
            mediaType={mediaType}
            loading={previewLoading}
            query={query.trim()}
            onShowAll={handleShowAllResults}
          />
        </View>
      ) : (
        <View style={[styles.activeContent, { paddingTop: headerHeight + 4 }]}>
          <SearchHistory
            history={history}
            onItemPress={handleHistoryItemPress}
            onClearHistory={handleClearHistory}
          />
        </View>
      )}
    </View>
  );
}

type SearchHeaderProps = {
  active: boolean;
  animation: Animated.Value;
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
    inputRange: [0, 0.55, 1],
    outputRange: [1, 0, 0],
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
    inputRange: [0.45, 1],
    outputRange: [0, 1],
  });
  const closeScale = animation.interpolate({
    inputRange: [0.45, 1],
    outputRange: [0.85, 1],
  });
  const pickerOpacity = animation.interpolate({
    inputRange: [0.55, 1],
    outputRange: [0, 1],
  });
  const pickerTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: contentTop + 2,
          backgroundColor: PlatformColor("systemBackground"),
        },
      ]}
    >
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
          <GlassView style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={18}
              color={PlatformColor("label")}
            />
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

          <Animated.View
            style={[
              styles.closeContainer,
              active ? styles.closeContainerVisible : styles.closeContainerHidden,
              { opacity: closeOpacity, transform: [{ scale: closeScale }] },
            ]}
            pointerEvents={active ? "auto" : "none"}
          >
            <TouchableOpacity
              activeOpacity={BUTTON.opacity}
              onPress={onClose}
              style={styles.closeButtonWrapper}
            >
              <GlassView style={styles.closeButton}>
                <Ionicons
                  name="close"
                  size={24}
                  color={PlatformColor("label")}
                />
              </GlassView>
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
    paddingHorizontal: 14,
    paddingBottom: 8,
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
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    height: SEARCH_BAR_HEIGHT,
    borderRadius: TOKENS.radius.full,
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
  closeContainerVisible: {
    width: CLOSE_BUTTON_SIZE,
  },
  closeContainerHidden: {
    width: 0,
  },
  closeButtonWrapper: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  pickerContainer: {
    height: SEARCH_BAR_HEIGHT,
  },
  genreRow: {
    justifyContent: "space-between",
  },
  genreContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 86,
  },
  activeContent: {
    flex: 1,
  },
});
