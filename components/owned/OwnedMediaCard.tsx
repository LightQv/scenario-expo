import {
  StyleSheet,
  Text,
  View,
  ColorValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatFullDate, formatRuntime } from "@/services/utils";
import { useThemeContext, useViewContext } from "@/contexts";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import i18n from "@/services/i18n";

type OwnedMediaCardProps = {
  data: OwnedMedia & {
    owned_scope?: "show" | "season";
    owned_season_count?: number;
    owned_episode_count?: number;
    availability_status?: TvAvailabilityStatus;
  };
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function OwnedMediaCard({
  data,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: OwnedMediaCardProps) {
  const { colors } = useThemeContext();
  const { isViewed } = useViewContext();
  const viewed = isViewed(data.tmdb_id, data.media_type);
  const showPartialBadge =
    data.media_type === "tv" && data.availability_status === "partial";

  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    if (data.owned_scope === "season") {
      return `${i18n.t("screen.detail.media.seasons.season.singular")} ${data.season_number} • ${getEpisodeLabel(data.owned_episode_count || 0)}`;
    }
    if (data.owned_scope === "show") {
      return `${getSeasonLabel(data.owned_season_count || 0)} • ${getEpisodeLabel(data.owned_episode_count || 0)}`;
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
        showPartialBadge ? (
          <View style={styles.partialBadge}>
            <Text style={styles.partialBadgeText}>
              {i18n.t("screen.detail.media.partial")}
            </Text>
          </View>
        ) : null
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
  partialBadge: {
    alignSelf: "center",
    borderRadius: 999,
    backgroundColor: "rgba(234,178,8,0.16)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  partialBadgeText: {
    color: "#eab208",
    fontSize: 11,
    fontWeight: "700",
  },
});

function getSeasonLabel(count: number) {
  const key =
    count === 1
      ? "screen.detail.media.seasons.season.singular"
      : "screen.detail.media.seasons.season.plurial";

  return `${count} ${i18n.t(key)}`;
}

function getEpisodeLabel(count: number) {
  const key =
    count === 1
      ? "screen.detail.media.seasons.episode.singular"
      : "screen.detail.media.seasons.episode.plurial";

  return `${count} ${i18n.t(key)}`;
}
