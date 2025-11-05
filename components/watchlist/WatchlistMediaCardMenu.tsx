import { StyleSheet, View } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { formatYear } from "@/services/utils";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useViewContext } from "@/contexts/ViewContext";
import { useUserContext } from "@/contexts/UserContext";
import { useBookmarkContext } from "@/contexts/BookmarkContext";

type WatchlistMediaCardMenuProps = {
  media: APIMedia;
  watchlistId: string;
  watchlistType?: string;
  onDelete?: () => void;
};

export default function WatchlistMediaCardMenu({
  media,
  watchlistId,
  watchlistType,
  onDelete,
}: WatchlistMediaCardMenuProps) {
  const { colors } = useThemeContext();
  const { user } = useUserContext();
  const { isViewed, getViewByTmdbId, addView, removeView } = useViewContext();
  const { refreshBookmarks } = useBookmarkContext();

  const viewed = isViewed(media.tmdb_id, media.media_type);

  const handleToggleView = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!user?.id) {
      notifyError(i18n.t("toast.error"));
      return;
    }

    try {
      if (viewed) {
        // Remove from views
        const existingView = getViewByTmdbId(media.tmdb_id, media.media_type);
        if (existingView) {
          await removeView(existingView.id);
        }
      } else {
        // Add to views
        const viewData: ViewCreate = {
          tmdb_id: media.tmdb_id,
          genre_ids: media.genre_ids,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          release_date: media.release_date,
          release_year: formatYear(media.release_date),
          runtime: media.runtime,
          title: media.title,
          media_type: media.media_type,
          viewer_id: user.id,
        };
        await addView(viewData);
      }
    } catch (err) {
      console.error("Error toggling view:", err);
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleDeleteMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiFetch(`/api/v1/medias/${media.id}`, {
        method: "DELETE",
      });

      notifySuccess(i18n.t("screen.watchlist.detail.menu.deleteSuccess"));

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

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          <Button
            onPress={handleToggleView}
            systemImage={viewed ? "eye.slash" : "eye"}
          >
            {viewed
              ? i18n.t("screen.watchlist.detail.menu.unview")
              : i18n.t("screen.watchlist.detail.menu.view")}
          </Button>
          <Button onPress={handleMoveToWatchlist} systemImage="folder">
            {i18n.t("screen.watchlist.detail.menu.move")}
          </Button>
          <Button
            onPress={handleDeleteMedia}
            systemImage="trash"
            role="destructive"
          >
            {i18n.t("screen.watchlist.detail.menu.delete")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button systemImage="ellipsis" color={colors.text} />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 34,
  },
});
