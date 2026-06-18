import {
  ActionSheetIOS,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { formatYear } from "@/services/utils";
import { notifyError } from "@/components/toasts/Toast";
import { useViewContext } from "@/contexts/ViewContext";
import { useUserContext } from "@/contexts/UserContext";
import { useBookmarkContext } from "@/contexts/BookmarkContext";
import { Ionicons } from "@expo/vector-icons";
import { BUTTON } from "@/constants/theme";

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

  const openMenu = () => {
    const viewLabel = viewed
      ? i18n.t("screen.watchlist.detail.menu.unview")
      : i18n.t("screen.watchlist.detail.menu.view");
    const moveLabel = i18n.t("screen.watchlist.detail.menu.move");
    const deleteLabel = i18n.t("screen.watchlist.detail.menu.delete");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            viewLabel,
            moveLabel,
            deleteLabel,
            i18n.t("form.watchlist.cancel"),
          ],
          cancelButtonIndex: 3,
          destructiveButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleToggleView();
          if (buttonIndex === 1) handleMoveToWatchlist();
          if (buttonIndex === 2) handleDeleteMedia();
        },
      );
      return;
    }

    Alert.alert("", "", [
      { text: viewLabel, onPress: handleToggleView },
      { text: moveLabel, onPress: handleMoveToWatchlist },
      { text: deleteLabel, onPress: handleDeleteMedia, style: "destructive" },
      { text: i18n.t("form.watchlist.cancel"), style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Media actions"
      activeOpacity={BUTTON.opacity}
      onPress={openMenu}
      style={styles.container}
    >
      <Ionicons
        name="ellipsis-horizontal"
        size={22}
        color={textColor || "#000"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
