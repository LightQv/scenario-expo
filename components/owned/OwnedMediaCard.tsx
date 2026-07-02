import {
  Alert,
  StyleSheet,
  Text,
  View,
  ColorValue,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { formatFullDate, formatRuntime } from "@/services/utils";
import {
  useOwnedMediaContext,
  useThemeContext,
  useViewContext,
} from "@/contexts";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import CompactMediaContextMenu, {
  type CompactMediaContextMenuAction,
} from "@/components/ui/CompactMediaContextMenu";
import { notifyPending } from "@/components/toasts/Toast";
import { colorWithAlpha } from "@/services/detailPalette";
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
  const { deleteOwnedMediaFromServer } = useOwnedMediaContext();
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

  const openDeleteConfirmation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(getDeleteTitle(data), getDeleteMessage(data), [
      {
        text: i18n.t("screen.profile.owned.delete.confirm"),
        style: "destructive",
        onPress: handleDeleteFromServer,
      },
      {
        text: i18n.t("screen.profile.owned.delete.cancel"),
        style: "cancel",
      },
    ]);
  };

  const handleDeleteFromServer = async () => {
    const pendingToast = notifyPending(
      i18n.t("toast.pending.ownedMedia.delete"),
    );

    try {
      await deleteOwnedMediaFromServer({
        tmdbId: data.tmdb_id,
        mediaType: data.media_type,
        scope: data.owned_scope === "season" ? "season" : "show",
        seasonNumber: data.season_number,
      });
      pendingToast.success(i18n.t("toast.success.ownedMedia.deleted"));
    } catch (error) {
      console.error("Error deleting owned media from server:", error);
      pendingToast.error(i18n.t("toast.error"));
    }
  };

  const actions: CompactMediaContextMenuAction[] = [
    {
      id: "delete",
      label: i18n.t("screen.profile.owned.delete.menu"),
      systemImage: "trash",
      destructive: true,
      onPress: openDeleteConfirmation,
    },
  ];

  const viewedIndicator = viewed ? (
    <View style={styles.viewedIndicator}>
      <Ionicons name="eye" size={11} color={colors.text} />
    </View>
  ) : null;

  const previewViewedIndicator = viewed ? (
    <View style={styles.previewViewedIndicator}>
      <Ionicons name="eye" size={11} color={colors.text} />
    </View>
  ) : null;

  const partialBadge = showPartialBadge ? (
    <View
      style={[
        styles.partialBadge,
        { backgroundColor: colorWithAlpha(colors.main, 0.16) },
      ]}
    >
      <Text style={[styles.partialBadgeText, { color: colors.main }]}>
        {i18n.t("screen.detail.media.partial")}
      </Text>
    </View>
  ) : null;

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
        leadingAccessory: previewViewedIndicator,
        trailingAccessory: partialBadge,
        viewed,
        badgeLabel: showPartialBadge ? i18n.t("screen.detail.media.partial") : undefined,
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
          leadingAccessory={viewedIndicator}
          trailingAccessory={partialBadge}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  previewViewedIndicator: {
    position: "absolute",
    left: 4,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
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
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  partialBadgeText: {
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

function getDeleteTitle(data: OwnedMediaCardProps["data"]) {
  if (data.media_type === "movie") {
    return i18n.t("screen.profile.owned.delete.movieTitle");
  }
  if (data.owned_scope === "season") {
    return i18n.t("screen.profile.owned.delete.seasonTitle", {
      season: data.season_number,
    });
  }
  return i18n.t("screen.profile.owned.delete.showTitle");
}

function getDeleteMessage(data: OwnedMediaCardProps["data"]) {
  if (data.media_type === "movie") {
    return i18n.t("screen.profile.owned.delete.movieMessage", {
      title: data.title,
    });
  }
  if (data.owned_scope === "season") {
    return i18n.t("screen.profile.owned.delete.seasonMessage", {
      title: data.title,
      season: data.season_number,
    });
  }
  return i18n.t("screen.profile.owned.delete.showMessage", {
    title: data.title,
  });
}
