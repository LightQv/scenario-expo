import { router, Stack } from "expo-router";
import { useState, createContext, useContext } from "react";
import GoBackButton from "@/components/ui/GoBackButton";

type MediaType = "movie" | "tv" | "person";

type SearchContextValue = {
  search: string;
  setSearch: (value: string) => void;
  mediaType: MediaType;
  setMediaType: (type: MediaType) => void;
};

const SearchContext = createContext<SearchContextValue>({
  search: "",
  setSearch: () => {},
  mediaType: "movie",
  setMediaType: () => {},
});

export const useSearchContext = () => useContext(SearchContext);

export default function SearchLayout() {
  const [search, setSearch] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  return (
    <SearchContext.Provider
      value={{ search, setSearch, mediaType, setMediaType }}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerLargeTitle: false,
            headerTransparent: true,
            headerShadowVisible: false,
            headerTitle: "",
            headerSearchBarOptions: {
              placement: "automatic",
              placeholder: "Search",
              onFocus: () => router.setParams({ showHistory: "true" }),
              onCancelButtonPress: () =>
                router.setParams({ showHistory: "false" }),
              onChangeText: (event) => setSearch(event.nativeEvent.text),
              onSearchButtonPress: () => {
                if (search.trim()) {
                  router.push("/(tabs)/search/query");
                }
              },
            },
          }}
        />
        <Stack.Screen
          name="query"
          options={{
            headerTransparent: true,
            headerShadowVisible: false,
            headerTitle: "",
            headerLeft: () => <GoBackButton />,
          }}
        />
        <Stack.Screen
          name="[genreId]"
          options={{
            headerTransparent: true,
            headerShadowVisible: false,
            headerTitle: "",
            headerLeft: () => <GoBackButton />,
          }}
        />
      </Stack>
    </SearchContext.Provider>
  );
}
