import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { formatYear } from "@/services/utils";
import { notifyError } from "@/components/toasts/Toast";
import { useBookmarkContext } from "@/contexts/BookmarkContext";
import useMediaViewAction from "@/hooks/useMediaViewAction";
import NativeCardMenu, {
  NativeCardMenuAction,
} from "@/components/ui/NativeCardMenu";

type WatchlistMediaCardMenuProps = {
  media: APIMedia;
  watchlistId: string;
  watchlistType?: string;
  onDelete?: () => void;
  textColor?: string;
};

export default function WatchlistMediaCardMenu({
  media,
  watchlistId,
  watchlistType,
  onDelete,
  textColor,
}: WatchlistMediaCardMenuProps) {
  const { refreshBookmarks } = useBookmarkContext();
  const { viewed, toggleView } = useMediaViewAction(
    {
      tmdbId: media.tmdb_id,
      genreIds: media.genre_ids,
      posterPath: media.poster_path,
      backdropPath: media.backdrop_path,
      releaseDate: media.release_date,
      releaseYear: formatYear(media.release_date),
      runtime: media.runtime,
      title: media.title,
      mediaType: media.media_type,
    },
    { haptics: true, unauthenticatedBehavior: "error" },
  );

  const handleDeleteMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiFetch(`/api/v1/medias/${media.id}`, {
        method: "DELETE",
      });

      // If deleting from a SYSTEM watchlist, refresh bookmarks
      if (watchlistType === "SYSTEM") {
        await refreshBookmarks();
      }

      // Call the onDelete callback to refresh the list
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
        mediaId: media.id,
        tmdbId: media.tmdb_id.toString(),
        currentWatchlistId: watchlistId,
      },
    });
  };

  const actions: NativeCardMenuAction[] = [
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
      separatorBefore: true,
      onPress: handleDeleteMedia,
    },
  ];

  return (
    <NativeCardMenu
      accessibilityLabel={i18n.t("navigation.actions.mediaActions")}
      actions={actions}
      textColor={textColor}
    />
  );
}
