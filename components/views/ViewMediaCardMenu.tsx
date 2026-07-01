import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";
import NativeCardMenu, {
  NativeCardMenuAction,
} from "@/components/ui/NativeCardMenu";

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

  const actions: NativeCardMenuAction[] = [
    {
      id: "add-to-watchlist",
      label: i18n.t("screen.detail.actions.addToWatchlist"),
      systemImage: "text.badge.plus",
      onPress: handleAddToWatchlist,
    },
    {
      id: "unview",
      label: i18n.t("screen.watchlist.detail.menu.unview"),
      systemImage: "eye.slash",
      destructive: true,
      separatorBefore: true,
      onPress: handleUnview,
    },
  ];

  return (
    <NativeCardMenu
      accessibilityLabel={i18n.t("navigation.actions.viewActions")}
      actions={actions}
      textColor={textColor}
    />
  );
}
