import {
  Dimensions,
  StyleSheet,
  View,
  PlatformColor,
  FlatList,
  ListRenderItem,
} from "react-native";
import { ContentUnavailableView, Host } from "@expo/ui/swift-ui";
import {
  useFocusEffect,
  useLocalSearchParams,
  useScrollToTop,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import i18n from "@/services/i18n";
import { useOwnedMediaContext, useThemeContext } from "@/contexts";
import {
  canUseOwnedMedia,
  type DownloadSettingsOverview,
  getDownloadSettingsOverview,
} from "@/services/downloadSettings";
import { TOKENS } from "@/constants/theme";
import OwnedMediaCard from "@/components/owned/OwnedMediaCard";
import OwnedMediaHeaderMenu from "@/components/owned/OwnedMediaHeaderMenu";
import HeaderTitle from "@/components/ui/HeaderTitle";
import FullScreenLoader from "@/components/ui/FullScreenLoader";
import GoBackButton from "@/components/ui/GoBackButton";
import OwnedMediaSyncStatusCard from "@/components/profile/OwnedMediaSyncStatusCard";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";
type OwnedMediaListItem = OwnedMedia & {
  owned_episode_count?: number;
  owned_latest_episode_air_date?: string | null;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CONTENT_TOP_PADDING = 200;
const CONTENT_BOTTOM_PADDING = 28;
const HEADER_BLOCK_HEIGHT = 168;
const EMPTY_STATE_HEIGHT = Math.max(
  240,
  SCREEN_HEIGHT -
    CONTENT_TOP_PADDING -
    CONTENT_BOTTOM_PADDING -
    HEADER_BLOCK_HEIGHT,
);

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
  const [filteredOwnedMedia, setFilteredOwnedMedia] = useState<
    OwnedMediaListItem[]
  >([]);
  const [sortType, setSortType] = useState<SortType>("title_asc");
  const [genreId, setGenreId] = useState<number | null>(null);
  const [downloadOverview, setDownloadOverview] = useState<
    DownloadSettingsOverview | null | undefined
  >(undefined);

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
    if (mediaType === "tv") {
      return i18n.t("screen.profile.owned.header.tv");
    }
    return i18n.t("screen.profile.owned.header.default");
  };

  useEffect(() => {
    let processed: OwnedMediaListItem[] = ownedMedia.filter(
      (media) => media.media_type === mediaType,
    );

    if (mediaType === "tv") {
      processed = groupOwnedTvRows(processed);
    }

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
          const dateA = new Date(getSortDate(a)).getTime();
          const dateB = new Date(getSortDate(b)).getTime();
          return dateA - dateB;
        });
        break;
      case "date_desc":
        processed.sort((a, b) => {
          const dateA = new Date(getSortDate(a)).getTime();
          const dateB = new Date(getSortDate(b)).getTime();
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

      getDownloadSettingsOverview()
        .then((overview) => {
          if (!cancelled) setDownloadOverview(overview);
        })
        .catch(() => {
          if (!cancelled) setDownloadOverview(null);
        });

      const checkSyncStatus = async () => {
        const previousStatus = lastSyncStatusRef.current;
        const previousFinishedAt = lastSyncFinishedAtRef.current;
        const latestSyncStatus = await refreshSyncStatus(
          mediaType === "tv" ? "SONARR" : "RADARR",
          mediaType === "tv" ? "tv" : "movie",
        );
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
    }, [mediaType, refreshOwnedMedia, refreshSyncStatus, syncStatus?.status]),
  );

  const backgroundColor = PlatformColor("systemBackground");
  const textColor = colors.text;
  const secondaryTextColor = isDark ? "#c9c9ce" : "#8e8e93";
  const ownedMediaReady = canUseOwnedMedia(downloadOverview, mediaType);

  const renderItem: ListRenderItem<OwnedMediaListItem> = ({ item }) => (
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
      <Host style={styles.emptyContainer}>
        <ContentUnavailableView
          systemImage={mediaType === "tv" ? "tv" : "film.stack"}
          title={i18n.t(
            mediaType === "tv"
              ? "screen.profile.owned.emptyState.tvTitle"
              : "screen.profile.owned.emptyState.title",
          )}
          description={i18n.t(
            mediaType === "tv"
              ? "screen.profile.owned.emptyState.tvBody"
              : "screen.profile.owned.emptyState.body",
          )}
        />
      </Host>
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

  if (downloadOverview === undefined) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <GoBackButton />
        <FullScreenLoader />
      </View>
    );
  }

  if (!ownedMediaReady) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <GoBackButton />
        <HeaderTitle title={getTitle()} />
        <Host style={styles.blockedContainer}>
          <ContentUnavailableView
            systemImage="gearshape.2"
            title={i18n.t("screen.profile.owned.unavailable.title")}
            description={i18n.t(
              mediaType === "tv"
                ? "screen.profile.owned.unavailable.tvBody"
                : "screen.profile.owned.unavailable.movieBody",
            )}
          />
        </Host>
      </View>
    );
  }

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
        keyExtractor={(item) =>
          item.media_type === "tv" ? `tv-${item.tmdb_id}` : item.id.toString()
        }
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
    paddingTop: CONTENT_TOP_PADDING,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  syncStatusContainer: {
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 18,
  },
  emptyContainer: {
    height: EMPTY_STATE_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  blockedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
  },
});

function groupOwnedTvRows(rows: OwnedMediaListItem[]): OwnedMediaListItem[] {
  const grouped = new Map<number, OwnedMediaListItem>();

  rows.forEach((row) => {
    const existing = grouped.get(row.tmdb_id);
    const rowAirDate = row.episode_air_date || row.release_date || null;

    if (!existing) {
      grouped.set(row.tmdb_id, {
        ...row,
        owned_episode_count: 1,
        owned_latest_episode_air_date: rowAirDate,
      });
      return;
    }

    existing.owned_episode_count = (existing.owned_episode_count || 0) + 1;
    if (isAfter(rowAirDate, existing.owned_latest_episode_air_date)) {
      existing.owned_latest_episode_air_date = rowAirDate;
    }
  });

  return Array.from(grouped.values());
}

function getSortDate(item: OwnedMediaListItem): string {
  return item.owned_latest_episode_air_date || item.release_date || "";
}

function isAfter(candidate?: string | null, current?: string | null): boolean {
  if (!candidate) return false;
  if (!current) return true;
  return new Date(candidate).getTime() > new Date(current).getTime();
}
