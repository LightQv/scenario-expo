import {
  StyleSheet,
  View,
  ColorValue,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { formatFullDate, formatRuntime, formatYear } from "@/services/utils";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useBookmarkContext } from "@/contexts/BookmarkContext";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import useMediaViewAction from "@/hooks/useMediaViewAction";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import CompactMediaContextMenu, {
  type CompactMediaContextMenuAction,
} from "@/components/ui/CompactMediaContextMenu";

type WatchlistMediaCardProps = {
  data: APIMedia;
  watchlistId: string;
  watchlistType?: string;
  onDelete?: () => void;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function WatchlistMediaCard({
  data,
  watchlistId,
  watchlistType,
  onDelete,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: WatchlistMediaCardProps) {
  const { colors } = useThemeContext();
  const { refreshBookmarks } = useBookmarkContext();
  const { viewed, toggleView } = useMediaViewAction(
    {
      tmdbId: data.tmdb_id,
      genreIds: data.genre_ids,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      releaseDate: data.release_date,
      releaseYear: formatYear(data.release_date),
      runtime: data.runtime,
      title: data.title,
      mediaType: data.media_type,
    },
    { haptics: true, unauthenticatedBehavior: "error" },
  );

  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    if (data.media_type === "tv") {
      const episodeLabel =
        data.runtime > 1
          ? i18n.t("screen.detail.media.seasons.episode.plurial")
          : i18n.t("screen.detail.media.seasons.episode.singular");
      return `${formatFullDate(data.release_date)} • ${data.runtime} ${episodeLabel}`;
    }
    return formatFullDate(data.release_date);
  };

  const handleDeleteMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiFetch(`/api/v1/medias/${data.id}`, {
        method: "DELETE",
      });

      if (watchlistType === "SYSTEM") {
        await refreshBookmarks();
      }

      if (onDelete) {
        onDelete();
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleMoveToWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-move",
      params: {
        mediaId: data.id,
        tmdbId: data.tmdb_id.toString(),
        currentWatchlistId: watchlistId,
      },
    });
  };

  const actions: CompactMediaContextMenuAction[] = [
    {
      id: "toggle-view",
      label: viewed
        ? i18n.t("screen.watchlist.detail.menu.unview")
        : i18n.t("screen.watchlist.detail.menu.view"),
      systemImage: viewed ? "eye.slash" : "eye",
      onPress: toggleView,
    },
    {
      id: "move",
      label: i18n.t("screen.watchlist.detail.menu.move"),
      systemImage: "arrow.right.arrow.left",
      onPress: handleMoveToWatchlist,
    },
    {
      id: "delete",
      label: i18n.t("screen.watchlist.detail.menu.delete"),
      systemImage: "trash",
      destructive: true,
      onPress: handleDeleteMedia,
    },
  ];

  const viewedIndicator = viewed ? (
    <View style={styles.viewedIndicator}>
      <Ionicons name="eye" size={11} color={colors.text} />
    </View>
  ) : null;

  const previewViewedIndicator = viewed ? (
    <View style={styles.previewViewedIndicator}>
      <Ionicons name="eye" size={11} color={colors.text} />
    </View>
  ) : null;

  return (
    <CompactMediaContextMenu
      actions={actions}
      preview={{
        title: data.title,
        subtitle: getMetadata(),
        posterPath: data.poster_path,
        backgroundColor,
        textColor,
        secondaryTextColor,
        leadingAccessory: previewViewedIndicator,
        viewed,
      }}
      trigger={
        <CompactMediaCard
          title={data.title}
          subtitle={getMetadata()}
          mediaType={data.media_type}
          tmdbId={data.tmdb_id}
          posterPath={data.poster_path}
          backgroundColor={backgroundColor}
          textColor={textColor}
          secondaryTextColor={secondaryTextColor}
          leadingAccessory={viewedIndicator}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  viewedIndicator: {
    position: "absolute",
    left: 2,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewViewedIndicator: {
    position: "absolute",
    left: 4,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
