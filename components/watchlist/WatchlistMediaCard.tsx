import {
  StyleSheet,
  View,
  ColorValue,
} from "react-native";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useViewContext } from "@/contexts/ViewContext";
import { useThemeContext } from "@/contexts/ThemeContext";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import WatchlistMediaCardMenu from "./WatchlistMediaCardMenu";

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
  const { isViewed } = useViewContext();
  const viewed = isViewed(data.tmdb_id, data.media_type);

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

  return (
    <CompactMediaCard
      title={data.title}
      subtitle={getMetadata()}
      mediaType={data.media_type}
      tmdbId={data.tmdb_id}
      posterPath={data.poster_path}
      backgroundColor={backgroundColor}
      textColor={textColor}
      secondaryTextColor={secondaryTextColor}
      leadingAccessory={
        viewed ? (
        <View style={styles.viewedIndicator}>
          <Ionicons name="eye" size={11} color={colors.text} />
        </View>
        ) : null
      }
      trailingAccessory={
        <WatchlistMediaCardMenu
          media={data}
          watchlistId={watchlistId}
          watchlistType={watchlistType}
          onDelete={onDelete}
          textColor={textColor}
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
});
