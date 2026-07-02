import {
  FlatList,
  ListRenderItem,
  PlatformColor,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useScrollToTop } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import { FONTS, TOKENS } from "@/constants/theme";
import ViewMediaCard from "@/components/views/ViewMediaCard";
import HeaderTitle from "@/components/ui/HeaderTitle";
import ViewHeaderMenu from "@/components/views/ViewHeaderMenu";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import GoBackButton from "@/components/ui/GoBackButton";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";

const COMPACT_MEDIA_SEPARATOR_HEIGHT = 2;

export default function ViewTypeScreen() {
  const { viewType } = useLocalSearchParams<{ viewType: string }>();
  const { colors, isDark } = useThemeContext();
  const { views, isLoading } = useViewContext();
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
    return i18n.t("screen.profile.view.title");
  };

  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
  };

  const handleGenreChange = (genre: number | null) => {
    setGenreId(genre);
  };

  useEffect(() => {
    if (views) {
      let processed = views.filter((view) => view.media_type === viewType);

      if (genreId !== null) {
        processed = processed.filter((view) =>
          view.genre_ids?.includes(genreId),
        );
      }

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

  const handleDelete = useCallback((id: string) => {
    setFilteredViews((prev) => prev.filter((view) => view.id !== id));
  }, []);

  const backgroundColor = PlatformColor("systemBackground");
  const textColor = colors.text;
  const secondaryTextColor = isDark ? "#c9c9ce" : "#8e8e93";

  const renderItem: ListRenderItem<APIMedia> = useCallback(
    ({ item }) => (
      <ViewMediaCard
        data={item}
        onDelete={handleDelete}
        backgroundColor={backgroundColor}
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
      />
    ),
    [backgroundColor, handleDelete, secondaryTextColor, textColor],
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return <FullScreenLoader />;

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
          {i18n.t("screen.watchlist.detail.empty")}
        </Text>
      </View>
    );
  }, [isLoading, secondaryTextColor]);

  const renderItemSeparator = useCallback(
    () => (
      <View
        style={{
          height: COMPACT_MEDIA_SEPARATOR_HEIGHT,
          backgroundColor,
        }}
      />
    ),
    [backgroundColor],
  );

  const renderHeader = useCallback(
    () => <HeaderTitle title={getTitle()} />,
    [viewType],
  );

  const keyExtractor = useCallback((item: APIMedia) => item.id.toString(), []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <GoBackButton />
      <ViewHeaderMenu
        mediaType={viewType}
        sortType={sortType}
        genreId={genreId}
        onSortChange={handleSortChange}
        onGenreChange={handleGenreChange}
      />
      <FlatList
        ref={listRef}
        data={filteredViews}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={renderItemSeparator}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        windowSize={9}
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
    paddingBottom: 28,
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
