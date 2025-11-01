import {
  View,
  FlatList,
  Animated,
  Dimensions,
  PlatformColor,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useGenreContext } from "@/contexts/GenreContext";
import { useSearchContext } from "./_layout";
import GenreCard from "@/components/search/GenreCard";
import SearchHistory from "@/components/search/SearchHistory";
import MediaTypePicker from "@/components/search/MediaTypePicker";
import AnimatedHeader from "@/components/ui/AnimatedHeader";
import {
  getSearchHistory,
  clearSearchHistory,
  type SearchHistoryItem,
} from "@/services/searchHistory";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@/services/i18n";
import { TOKENS } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SearchScreen() {
  const { totalGenres, loading } = useGenreContext();
  const { mediaType, setMediaType, setSearch } = useSearchContext();
  const { showHistory: showHistoryParam } = useLocalSearchParams<{
    showHistory?: string;
  }>();
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const historyTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const genreOpacity = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  const insets = useSafeAreaInsets();
  const genreListRef = useRef<FlatList<any> | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    setShowHistory(showHistoryParam === "true");
  }, [showHistoryParam]);

  useEffect(() => {
    if (showHistory) {
      Animated.parallel([
        Animated.timing(historyTranslateY, {
          toValue: insets.top,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 200,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 0,
          duration: 250,
          delay: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(historyTranslateY, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 220,
          delay: 0,
          useNativeDriver: true,
        }),
        Animated.timing(genreOpacity, {
          toValue: 1,
          duration: 220,
          delay: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        genreListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      });
    }
  }, [showHistory, insets.top]);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = async (item: SearchHistoryItem) => {
    setSearch(item.query);
    setMediaType(item.type);
    router.push("/(tabs)/search/query");
  };

  const handleScroll = () => Keyboard.dismiss();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: PlatformColor("systemBackground"),
        }}
      >
        <ActivityIndicator size="large" color={PlatformColor("label")} />
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: PlatformColor("systemBackground") }}
    >
      <Animated.View
        pointerEvents={showHistory ? "none" : "auto"}
        style={{ opacity: headerOpacity }}
      >
        <AnimatedHeader
          title={i18n.t("screen.search.title")}
          scrollY={scrollY}
        />
      </Animated.View>

      {/* Genres */}
      <Animated.View style={{ flex: 1, opacity: genreOpacity }}>
        <Animated.FlatList
          ref={genreListRef}
          data={totalGenres}
          renderItem={({ item }) => <GenreCard id={item.id} name={item.name} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingTop: 130,
            paddingHorizontal: TOKENS.margin.horizontal,
            paddingBottom: 80,
          }}
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

      {/* History */}
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: PlatformColor("systemBackground"),
          transform: [{ translateY: historyTranslateY }],
        }}
      >
        <View style={{ marginBottom: 28 }}>
          <MediaTypePicker
            selectedType={mediaType}
            onTypeChange={setMediaType}
          />
        </View>

        <FlatList
          data={[{ key: "history" }]}
          renderItem={() => (
            <SearchHistory
              history={history}
              onItemPress={handleHistoryItemPress}
              onClearHistory={handleClearHistory}
            />
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{
            paddingHorizontal: TOKENS.margin.horizontal,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}
