import { StyleSheet, useColorScheme, View } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";

type WatchlistMediaCardMenuProps = {
  media: APIMedia;
  watchlistId: string;
};

export default function WatchlistMediaCardMenu({
  media,
  watchlistId,
}: WatchlistMediaCardMenuProps) {
  const colorScheme = useColorScheme();
  const { isViewed, addView, removeView, getViewByTmdbId } = useViewContext();

  const viewed = isViewed(media.tmdb_id, media.media_type);

  const handleToggleView = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (viewed) {
      // Remove view
      const viewObj = getViewByTmdbId(media.tmdb_id, media.media_type);
      if (viewObj) {
        try {
          await removeView(viewObj.id);
        } catch (err) {
          console.error("Error removing view:", err);
        }
      }
    } else {
      // Add view
      try {
        await addView({
          tmdb_id: media.tmdb_id,
          genre_ids: media.genre_ids,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          release_date: media.release_date,
          release_year: media.release_year,
          runtime: media.runtime,
          title: media.title,
          media_type: media.media_type,
          viewer_id: media.viewer_id || "",
        });
      } catch (err) {
        console.error("Error adding view:", err);
      }
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
          <Button
            onPress={handleToggleView}
            systemImage={viewed ? "eye.slash" : "eye"}
          >
            {viewed
              ? i18n.t("screen.watchlist.detail.menu.unview")
              : i18n.t("screen.watchlist.detail.menu.view")}
          </Button>
          <Button onPress={handleMoveToWatchlist} systemImage="arrow.right">
            {i18n.t("screen.watchlist.detail.menu.move")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image
                systemName="ellipsis"
                color={colorScheme === "dark" ? "#fff" : "#000"}
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
