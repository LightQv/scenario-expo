import {
  StyleSheet,
  ScrollView,
  View,
  PlatformColor,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { useGenreContext } from "@/contexts/GenreContext";
import { useSearchContext } from "./_layout";
import GenreCard from "@/components/search/GenreCard";
import HeaderTitle from "@/components/ui/HeaderTitle";
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
      <HeaderTitle title={i18n.t("screen.search.title")} />

      <View style={styles.grid}>
        {totalGenres?.map((genre) => (
          <GenreCard key={genre.id} id={genre.id} name={genre.name} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
