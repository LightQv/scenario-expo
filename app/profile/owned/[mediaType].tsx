import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  FlatList,
  ListRenderItem,
} from "react-native";
import {
  useFocusEffect,
  useLocalSearchParams,
  useScrollToTop,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import i18n from "@/services/i18n";
import { useOwnedMediaContext, useThemeContext } from "@/contexts";
import { TOKENS, FONTS } from "@/constants/theme";
import OwnedMediaCard from "@/components/owned/OwnedMediaCard";
import OwnedMediaHeaderMenu from "@/components/owned/OwnedMediaHeaderMenu";
import HeaderTitle from "@/components/ui/HeaderTitle";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import GoBackButton from "@/components/ui/GoBackButton";
import OwnedMediaSyncStatusCard from "@/components/profile/OwnedMediaSyncStatusCard";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";

export default function OwnedMediaTypeScreen() {
  const { mediaType } = useLocalSearchParams<{ mediaType: string }>();
  const { colors, isDark } = useThemeContext();
  const {
    ownedMedia,
    isLoading,
    refreshOwnedMedia,
    refreshSyncStatus,
    syncStatus,
  } = useOwnedMediaContext();
  const [filteredOwnedMedia, setFilteredOwnedMedia] = useState<OwnedMedia[]>(
    [],
  );
  const [sortType, setSortType] = useState<SortType>("title_asc");
  const [genreId, setGenreId] = useState<number | null>(null);

  const listRef = useRef<FlatList>(null);
  const lastSyncStatusRef = useRef<OwnedMediaSyncStatus["status"] | "idle">(
    syncStatus?.status || "idle",
  );
  const lastSyncFinishedAtRef = useRef<string | null>(
    syncStatus?.finished_at || null,
  );
  useScrollToTop(listRef);

  const getTitle = () => {
    if (mediaType === "movie") {
      return i18n.t("screen.profile.owned.header.movie");
    }
    return i18n.t("screen.profile.owned.header.default");
  };

  useEffect(() => {
    let processed = ownedMedia.filter(
      (media) => media.media_type === mediaType,
    );

    if (genreId !== null) {
      processed = processed.filter((media) =>
        media.genre_ids?.includes(genreId),
      );
    }

    switch (sortType) {
      case "title_asc":
        processed.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title_desc":
        processed.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
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

    setFilteredOwnedMedia(processed);
  }, [ownedMedia, mediaType, sortType, genreId]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const checkSyncStatus = async () => {
        const previousStatus = lastSyncStatusRef.current;
        const previousFinishedAt = lastSyncFinishedAtRef.current;
        const latestSyncStatus = await refreshSyncStatus();
        if (cancelled) return;

        const nextStatus = latestSyncStatus?.status || "idle";
        const nextFinishedAt = latestSyncStatus?.finished_at || null;
        const syncJustFinished =
          previousStatus === "running" && nextStatus !== "running";
        const finishedAtChanged =
          Boolean(previousFinishedAt) &&
          Boolean(nextFinishedAt) &&
          previousFinishedAt !== nextFinishedAt;

        if (syncJustFinished || finishedAtChanged) {
          await refreshOwnedMedia();
        }

        lastSyncStatusRef.current = nextStatus;
        lastSyncFinishedAtRef.current = nextFinishedAt;
        timeoutId = setTimeout(
          checkSyncStatus,
          nextStatus === "running" ? 3000 : 30000,
        );
      };

      refreshOwnedMedia();
      checkSyncStatus();

      return () => {
        cancelled = true;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [refreshOwnedMedia, refreshSyncStatus, syncStatus?.status]),
  );

  const backgroundColor = PlatformColor("systemBackground");
  const textColor = colors.text;
  const secondaryTextColor = isDark ? "#c9c9ce" : "#8e8e93";

  const renderItem: ListRenderItem<OwnedMedia> = ({ item }) => (
    <OwnedMediaCard
      data={item}
      backgroundColor={backgroundColor}
      textColor={textColor}
      secondaryTextColor={secondaryTextColor}
    />
  );

  const renderEmpty = () => {
    if (isLoading) return <FullScreenLoader />;

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
          {i18n.t("screen.profile.owned.empty")}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <HeaderTitle title={getTitle()} />
      <View style={styles.syncStatusContainer}>
        <OwnedMediaSyncStatusCard compact syncStatus={syncStatus} />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <GoBackButton />
      <OwnedMediaHeaderMenu
        mediaType={mediaType || "movie"}
        sortType={sortType}
        genreId={genreId}
        onSortChange={setSortType}
        onGenreChange={setGenreId}
      />
      <FlatList
        ref={listRef}
        data={filteredOwnedMedia}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={() => (
          <View style={{ height: 2, backgroundColor }} />
        )}
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
  syncStatusContainer: {
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 18,
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
