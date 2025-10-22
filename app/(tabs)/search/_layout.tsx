import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState, createContext, useContext } from "react";
import { Pressable, useColorScheme, FlatList } from "react-native";
import i18n from "@/services/i18n";

type MediaType = "movie" | "tv" | "person";

type SearchContextValue = {
  search: string;
  setSearch: (value: string) => void;
  showHistory: boolean;
  setShowHistory: (value: boolean) => void;
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
  genreScrollRef: React.RefObject<FlatList> | null;
  setGenreScrollRef: (ref: React.RefObject<FlatList>) => void;
};

const SearchContext = createContext<SearchContextValue>({
  search: "",
  setSearch: () => {},
  showHistory: false,
  setShowHistory: () => {},
  mediaType: "movie",
  setMediaType: () => {},
  genreScrollRef: null,
  setGenreScrollRef: () => {},
});

export const useSearchContext = () => useContext(SearchContext);

export default function SearchLayout() {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [genreScrollRef, setGenreScrollRefState] = useState<React.RefObject<FlatList> | null>(null);

  const setGenreScrollRef = (ref: React.RefObject<FlatList>) => {
    setGenreScrollRefState(ref);
  };

  const handleCancelButtonPress = () => {
    setSearch("");
    setShowHistory(false);
    // Scroll animation handled by the index screen's useEffect
  };

  const handleSearchButtonPress = () => {
    if (search.trim()) {
      setShowHistory(false);
      router.push("/(tabs)/search/query");
    }
  };

  return (
    <SearchContext.Provider
      value={{
        search,
        setSearch,
        showHistory,
        setShowHistory,
        mediaType,
        setMediaType,
        genreScrollRef,
        setGenreScrollRef,
      }}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerLargeTitle: false,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
            headerTitle: "",
            headerSearchBarOptions: {
              placement: "automatic",
              placeholder: i18n.t("screen.search.placeholder"),
              onChangeText: (event) => {
                const text = event.nativeEvent.text;
                setSearch(text);
              },
              onFocus: () => {
                setShowHistory(true);
              },
              onCancelButtonPress: handleCancelButtonPress,
              onSearchButtonPress: handleSearchButtonPress,
            },
          }}
        />
        <Stack.Screen
          name="query"
          options={{
            headerLargeTitle: false,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
            headerTitle: "",
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                  style={{ marginLeft: 2 }}
                />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="[genreId]"
          options={{
            headerLargeTitle: false,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
            headerTitle: "",
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                  style={{ marginLeft: 2 }}
                />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </SearchContext.Provider>
  );
}
