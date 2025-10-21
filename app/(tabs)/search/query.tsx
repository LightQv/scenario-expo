import {
  StyleSheet,
  View,
  FlatList,
  Text,
  PlatformColor,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useScrollToTop } from "@react-navigation/native";
import { useSearchContext } from "./_layout";
import MediaCard from "@/components/discover/MediaCard";
import PersonCard from "@/components/discover/PersonCard";
import { TOKENS, FONTS } from "@/constants/theme";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { addSearchToHistory } from "@/services/searchHistory";

type FetchParams = {
  page: number;
};

export default function QueryScreen() {
  const { search, mediaType, setShowHistory } = useSearchContext();
  const [fetchParams, setFetchParams] = useState<FetchParams>({ page: 1 });
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TmdbData[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  // Execute search when component mounts or when search/mediaType changes
  useEffect(() => {
    if (search) {
      executeSearch();
    }
  }, []);

  // Fetch data when loading state changes
  useEffect(() => {
    if (loading && search) {
      fetchSearchResults();
    }
  }, [loading]);

  // Save to history after successful fetch
  useEffect(() => {
    if (search && !loading && totalResults > 0) {
      addSearchToHistory(search, mediaType);
    }
  }, [loading, totalResults]);

  const executeSearch = () => {
    setResults([]);
    setFetchParams({ page: 1 });
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    setLoading(true);
    setShowHistory(false);
  };

  const fetchSearchResults = async () => {
    try {
      const endpoint =
        mediaType === "person"
          ? `/search/person?query=${search}&language=${i18n.locale}&page=${fetchParams.page}`
          : `/search/${mediaType}?query=${search}&include_adult=false&language=${i18n.locale}&page=${fetchParams.page}`;

      const data = await tmdbFetch(endpoint);

      if (data.total_results > 0) {
        setResults(
          fetchParams.page === 1 ? data.results : [...results, ...data.results],
        );
        setTotalPages(data.total_pages);
        setTotalResults(data.total_results);
      } else {
        notifyError(i18n.t("toast.errorQuery"));
        setTotalPages(0);
        setTotalResults(0);
      }
    } catch (error) {
      notifyError(i18n.t("toast.errorTMDB"));
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (fetchParams.page < totalPages) {
      setFetchParams({ page: fetchParams.page + 1 });
      setLoading(true);
    }
  };

  const renderItem = ({ item }: { item: TmdbData }) => {
    if (mediaType === "person") {
      return <PersonCard data={item} size="grid" />;
    }
    return <MediaCard data={item} mediaType={mediaType} size="grid" />;
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PlatformColor("label")} />
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    if (results.length === 0) return null;

    return (
      <View style={styles.footer}>
        {fetchParams.page < totalPages ? (
          <ActivityIndicator size="small" color={PlatformColor("label")} />
        ) : (
          <Text
            style={[
              styles.footerText,
              { color: PlatformColor("secondaryLabel") },
            ]}
          >
            {totalResults}{" "}
            {totalResults === 1
              ? i18n.t("screen.search.result.singular")
              : i18n.t("screen.search.result.plurial")}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <FlatList
        ref={listRef}
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.media_type || mediaType}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        onEndReached={handleNextPage}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 130,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
  },
});
