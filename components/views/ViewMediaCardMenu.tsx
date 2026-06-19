import {
  ActionSheetIOS,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";
import { BUTTON } from "@/constants/theme";

type ViewMediaCardMenuProps = {
  media: APIMedia;
  onDelete?: (id: string) => void;
  textColor?: string;
};

export default function ViewMediaCardMenu({
  media,
  onDelete,
  textColor,
}: ViewMediaCardMenuProps) {
  const { removeView } = useViewContext();

  const handleUnview = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await removeView(media.id);

      // Call the onDelete callback to remove from local state
      if (onDelete) {
        onDelete(media.id);
      }
    } catch (err) {
      console.error("Error removing view:", err);
      // Error is already handled in removeView
    }
  };

  const handleAddToWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-add",
      params: {
        tmdbId: media.tmdb_id.toString(),
        mediaType: media.media_type,
        title: media.title,
      },
    });
  };

  const openMenu = () => {
    const addToWatchlistLabel = i18n.t("screen.detail.actions.addToWatchlist");
    const unviewLabel = i18n.t("screen.watchlist.detail.menu.unview");
    const cancelLabel = i18n.t("form.watchlist.cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [addToWatchlistLabel, unviewLabel, cancelLabel],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleAddToWatchlist();
          if (buttonIndex === 1) handleUnview();
        },
      );
      return;
    }

    Alert.alert("", "", [
      { text: addToWatchlistLabel, onPress: handleAddToWatchlist },
      { text: unviewLabel, onPress: handleUnview, style: "destructive" },
      { text: cancelLabel, style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="View actions"
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
