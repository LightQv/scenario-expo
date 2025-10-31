import {
  StyleSheet,
  View,
  PlatformColor,
  ActivityIndicator,
  Keyboard,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router, useNavigation } from "expo-router";
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SearchIndexScreen() {
  const { totalGenres, loading } = useGenreContext();
  const { showHistory, mediaType, setMediaType, search, setSearch, setGenreScrollRef } =
    useSearchContext();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const genreListRef = useRef<FlatList>(null);
  const historyListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Animation values
  const historyTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const genreOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadHistory();
    // Register the list ref
    if (genreListRef) {
      setGenreScrollRef(genreListRef);
    }
  }, [setGenreScrollRef]);

  // Animate transitions when showHistory changes
  useEffect(() => {
    if (showHistory) {
      // Show history: slide history up, fade out genres
      Animated.parallel([
        Animated.timing(historyTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide history: slide history down, fade in genres, scroll to top
      Animated.parallel([
        Animated.timing(historyTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Scroll to top after animation completes
        genreListRef.current?.scrollToOffset({ offset: 0, animated: true });
      });
    }
  }, [showHistory, historyTranslateY, genreOpacity]);

  // Update header with MediaTypePicker when showing history
  useEffect(() => {
    if (showHistory) {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ width: 300, marginTop: 8 }}>
            <MediaTypePicker
              selectedType={mediaType}
              onTypeChange={setMediaType}
            />
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        headerTitle: "",
      });
    }
  }, [showHistory, mediaType, setMediaType, navigation]);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = async (item: SearchHistoryItem) => {
    // Set search query and media type from history
    setSearch(item.query);
    setMediaType(item.type);
    // Navigate to query page
    router.push("/(tabs)/search/query");
  };

  const handleScroll = () => {
    Keyboard.dismiss();
  };

  const renderGenreItem = ({ item }: { item: Genre }) => {
    return <GenreCard id={item.id} name={item.name} />;
  };

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
      {/* AnimatedHeader - always rendered */}
      <View style={{ display: showHistory ? "none" : "block" }}>
        <AnimatedHeader
          title={i18n.t("screen.search.title")}
          scrollY={scrollY}
        />
      </View>
      {/* Genre List - always rendered, fades out when history shown */}
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
          contentContainerStyle={styles.genreContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: false,
              listener: handleScroll,
            },
          )}
          scrollEventThrottle={16}
        />
      </Animated.View>

      {/* History List - slides up from bottom */}
      <Animated.View
        style={[
          styles.historyContainer,
          {
            backgroundColor: PlatformColor("systemBackground"),
            transform: [{ translateY: historyTranslateY }],
          },
        ]}
        pointerEvents={showHistory ? "auto" : "none"}
      >
        <Animated.FlatList
          ref={historyListRef}
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
    paddingTop: 130,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  historyContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  historyContent: {
    paddingTop: 130,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 80,
  },
});
