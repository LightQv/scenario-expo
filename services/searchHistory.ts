import * as SecureStore from "expo-secure-store";

const SEARCH_HISTORY_KEY = "scenario_search_history";
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  type: "movie" | "tv" | "person";
  timestamp: number;
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const history = await SecureStore.getItemAsync(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading search history:", error);
    return [];
  }
}

export async function addSearchToHistory(
  query: string,
  type: "movie" | "tv" | "person"
): Promise<void> {
  try {
    const history = await getSearchHistory();

    // Remove duplicate if exists (same query and type)
    const filteredHistory = history.filter(
      (item) => !(item.query === query && item.type === type)
    );

    // Add new search at the beginning
    const newHistory: SearchHistoryItem[] = [
      { query, type, timestamp: Date.now() },
      ...filteredHistory,
    ].slice(0, MAX_HISTORY_ITEMS);

    await SecureStore.setItemAsync(
      SEARCH_HISTORY_KEY,
      JSON.stringify(newHistory)
    );
  } catch (error) {
    console.error("Error adding search to history:", error);
  }
}

export async function clearSearchHistory(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
}
