import {
  StyleSheet,
  ScrollView,
  View,
  PlatformColor,
  ActivityIndicator,
  Keyboard,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
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

export default function SearchIndexScreen() {
  const { totalGenres, loading } = useGenreContext();
  const { showHistory, mediaType, setMediaType, search } = useSearchContext();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const savedHistory = await getSearchHistory();
    setHistory(savedHistory);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleHistoryItemPress = async (item: SearchHistoryItem) => {
    // TODO: Navigate to query results page
    // For now, we'll just add it back to history
    await addSearchToHistory(item.query, item.type);
    await loadHistory();
  };

  const handleScroll = () => {
    Keyboard.dismiss();
  };

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

  if (showHistory) {
    return (
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <MediaTypePicker selectedType={mediaType} onTypeChange={setMediaType} />
        <SearchHistory
          history={history}
          onItemPress={handleHistoryItemPress}
          onClearHistory={handleClearHistory}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.wrapper}>
      <AnimatedHeader title={i18n.t("screen.search.title")} scrollY={scrollY} />

      <Animated.ScrollView
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.grid}>
          {totalGenres?.map((genre) => (
            <GenreCard key={genre.id} id={genre.id} name={genre.name} />
          ))}
        </View>
      </Animated.ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingTop: 16,
  },
  grid: {
    flexDirection: "row",
    paddingHorizontal: TOKENS.margin.horizontal,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
