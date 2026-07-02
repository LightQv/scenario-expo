import { ColorValue } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";
import { useViewContext } from "@/contexts/ViewContext";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import CompactMediaContextMenu, {
  type CompactMediaContextMenuAction,
} from "@/components/ui/CompactMediaContextMenu";

type ViewMediaCardProps = {
  data: APIMedia;
  onDelete?: (id: string) => void;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function ViewMediaCard({
  data,
  onDelete,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: ViewMediaCardProps) {
  const { removeView } = useViewContext();

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

  const handleUnview = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await removeView(data.id);

      if (onDelete) {
        onDelete(data.id);
      }
    } catch (err) {
      console.error("Error removing view:", err);
    }
  };

  const handleAddToWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-add",
      params: {
        tmdbId: data.tmdb_id.toString(),
        mediaType: data.media_type,
        title: data.title,
      },
    });
  };

  const actions: CompactMediaContextMenuAction[] = [
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
      onPress: handleUnview,
    },
  ];

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
          textRightMargin={0}
        />
      }
    />
  );
}
