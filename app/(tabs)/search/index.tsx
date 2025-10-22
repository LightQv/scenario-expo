import {
  StyleSheet,
  View,
  PlatformColor,
  ActivityIndicator,
  Keyboard,
  Animated,
  FlatList,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGenreContext } from "@/contexts/GenreContext";
import { useSearchContext } from "./_layout";
import GenreCard from "@/components/search/GenreCard";
import AnimatedHeader from "@/components/ui/AnimatedHeader";
import SearchHistory from "@/components/search/SearchHistory";
import MediaTypePicker from "@/components/search/MediaTypePicker";
import i18n from "@/services/i18n";
import { TOKENS } from "@/constants/theme";
import {
  getSearchHistory,
  clearSearchHistory,
  addSearchToHistory,
  type SearchHistoryItem,
} from "@/services/searchHistory";

const HEADER_HEIGHT = 64;

export default function SearchIndexScreen() {
  const { totalGenres, loading } = useGenreContext();
  const {
    showHistory,
    mediaType,
    setMediaType,
    setGenreScrollRef,
    setSearch,
    setShowHistory,
  } = useSearchContext();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const genreListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const genreOpacity = useRef(new Animated.Value(1)).current;
  const historyOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
    if (genreListRef) setGenreScrollRef(genreListRef);
  }, [setGenreScrollRef]);

  useEffect(() => {
    if (showHistory) {
      Animated.parallel([
        Animated.timing(historyOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(historyOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        genreListRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
  }, [showHistory]);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = async (item: SearchHistoryItem) => {
    // Set the search query and media type from history item
    setSearch(item.query);
    setMediaType(item.type);

    // Add to history (updates timestamp)
    await addSearchToHistory(item.query, item.type);
    await loadHistory();

    // Hide history and navigate to query page
    setShowHistory(false);
    router.push("/(tabs)/search/query");
  };

  const handleScroll = () => Keyboard.dismiss();

  const renderGenreItem = ({ item }: { item: Genre }) => (
    <GenreCard id={item.id} name={item.name} />
  );

  const renderHistoryHeader = () => (
    <SearchHistory
      history={history}
      onItemPress={handleHistoryItemPress}
      onClearHistory={handleClearHistory}
    />
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
      >
        <ActivityIndicator size="large" color={PlatformColor("label")} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* HEADER */}
      <Animated.View
        style={[
          {
            opacity: headerOpacity,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          },
        ]}
        pointerEvents={showHistory ? "none" : "auto"}
      >
        <AnimatedHeader
          title={i18n.t("screen.search.title")}
          scrollY={scrollY}
        />
      </Animated.View>

      {/* PICKER */}
      {showHistory && (
        <View
          style={{
            position: "absolute",
            top: insets.top,
            left: 0,
            right: 0,
            paddingVertical: 8,
            zIndex: 25,
          }}
        >
          <MediaTypePicker
            selectedType={mediaType}
            onTypeChange={setMediaType}
          />
        </View>
      )}

      {/* GENRES */}
      <Animated.View
        style={[styles.listContainer, { opacity: genreOpacity }]}
        pointerEvents={showHistory ? "none" : "auto"}
      >
        <Animated.FlatList
          ref={genreListRef}
          data={totalGenres}
          renderItem={renderGenreItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.genreContent,
            { paddingTop: HEADER_HEIGHT + insets.top + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false, listener: handleScroll },
          )}
          scrollEventThrottle={16}
        />
      </Animated.View>

      {/* HISTORIQUE */}
      <Animated.View
        style={[
          styles.historyContainer,
          {
            opacity: historyOpacity,
            backgroundColor: PlatformColor("systemBackground"),
            top: insets.top + HEADER_HEIGHT / 2,
          },
        ]}
        pointerEvents={showHistory ? "auto" : "none"}
      >
        <Animated.FlatList
          data={[{ key: "history" }]}
          renderItem={renderHistoryHeader}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
  },
  genreContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 84,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  historyContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: TOKENS.margin.horizontal,
    zIndex: 20,
  },
  historyContent: {
    paddingTop: 16,
    paddingBottom: 84,
  },
});
