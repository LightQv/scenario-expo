import { StyleSheet, View } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useThemeContext } from "@/contexts/ThemeContext";

type WatchlistMediaCardMenuProps = {
  media: APIMedia;
  watchlistId: string;
  onDelete?: () => void;
};

export default function WatchlistMediaCardMenu({
  media,
  watchlistId,
  onDelete,
}: WatchlistMediaCardMenuProps) {
  const { colors } = useThemeContext();

  const handleDeleteMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await apiFetch(`/api/v1/medias/${media.id}`, {
        method: "DELETE",
      });

      notifySuccess(i18n.t("screen.watchlist.detail.menu.deleteSuccess"));

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
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Button onPress={handleMoveToWatchlist} systemImage="arrow.right">
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
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image
                systemName="ellipsis"
                color={colors.text}
              />
            </Host>
          </View>
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
