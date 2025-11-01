import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  FlatList,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useScrollToTop } from "@react-navigation/native";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";
import { TOKENS, FONTS } from "@/constants/theme";
import ViewMediaCard from "@/components/views/ViewMediaCard";
import HeaderTitle from "@/components/ui/HeaderTitle";
import ViewHeaderMenu from "@/components/views/ViewHeaderMenu";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";

export default function ViewTypeScreen() {
  const { viewType } = useLocalSearchParams<{ viewType: string }>();
  const { views, isLoading } = useViewContext();
  const navigation = useNavigation();
  const [filteredViews, setFilteredViews] = useState<APIMedia[]>([]);
  const [sortType, setSortType] = useState<SortType>("title_asc");
  const [genreId, setGenreId] = useState<number | null>(null);

  const listRef = useRef<FlatList>(null);
  useScrollToTop(listRef);

  const getTitle = () => {
    if (viewType === "movie") {
      return i18n.t("screen.profile.view.header.movie");
    } else if (viewType === "tv") {
      return i18n.t("screen.profile.view.header.tv");
    }
    return "Views";
  };

  // Handle sort change
  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
  };

  // Handle genre filter change
  const handleGenreChange = (genre: number | null) => {
    setGenreId(genre);
  };

  // Configure header with menu
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ViewHeaderMenu
          mediaType={viewType}
          sortType={sortType}
          genreId={genreId}
          onSortChange={handleSortChange}
          onGenreChange={handleGenreChange}
        />
      ),
    });
  }, [navigation, viewType, sortType, genreId]);

  // Filter, sort and process views
  useEffect(() => {
    if (views) {
      let processed = views.filter((view) => view.media_type === viewType);

      // Apply genre filter
      if (genreId !== null) {
        processed = processed.filter((view) =>
          view.genre_ids?.includes(genreId),
        );
      }

      // Apply sort
      switch (sortType) {
        case "title_asc":
          processed.sort((a, b) =>
            (a.title || "").localeCompare(b.title || ""),
          );
          break;
        case "title_desc":
          processed.sort((a, b) =>
            (b.title || "").localeCompare(a.title || ""),
          );
          break;
        case "date_asc":
          processed.sort((a, b) => {
            const dateA = new Date(a.release_date || "").getTime();
            const dateB = new Date(b.release_date || "").getTime();
            return dateA - dateB;
          });
          break;
        case "date_desc":
          processed.sort((a, b) => {
            const dateA = new Date(a.release_date || "").getTime();
            const dateB = new Date(b.release_date || "").getTime();
            return dateB - dateA;
          });
          break;
      }

      setFilteredViews(processed);
    } else {
      setFilteredViews([]);
    }
  }, [views, viewType, sortType, genreId]);

  // Handle local deletion to avoid scroll to top
  const handleDelete = (id: string) => {
    setFilteredViews((prev) => prev.filter((view) => view.id !== id));
  };

  const renderItem: ListRenderItem<APIMedia> = ({ item }) => (
    <ViewMediaCard data={item} onDelete={handleDelete} />
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PlatformColor("label")} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text
          style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
        >
          {i18n.t("screen.watchlist.detail.empty")}
        </Text>
      </View>
    );
  };

  const renderItemSeparator = () => (
    <View
      style={{ height: 2, backgroundColor: PlatformColor("systemBackground") }}
    />
  );

  const renderHeader = () => <HeaderTitle title={getTitle()} />;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <FlatList
        ref={listRef}
        data={filteredViews}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderItemSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 200,
    paddingBottom: 86,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
    textAlign: "center",
  },
});
