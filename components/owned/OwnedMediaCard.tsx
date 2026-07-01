import {
  Alert,
  Dimensions,
  PlatformColor,
  StyleSheet,
  Text,
  View,
  ColorValue,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  Button as NativeButton,
  ContextMenu,
  Host,
  RNHostView,
} from "@expo/ui/swift-ui";
import { Ionicons } from "@expo/vector-icons";
import { formatFullDate, formatRuntime } from "@/services/utils";
import {
  useOwnedMediaContext,
  useThemeContext,
  useViewContext,
} from "@/contexts";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import { notifyPending } from "@/components/toasts/Toast";
import { BLURHASH, FONTS, TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

const PREVIEW_WIDTH =
  Dimensions.get("window").width - TOKENS.margin.horizontal * 2;

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

  return (
    <Host style={styles.contextMenuHost}>
      <ContextMenu>
        <ContextMenu.Items>
          <NativeButton
            label={i18n.t("screen.profile.owned.delete.menu")}
            systemImage="trash"
            role="destructive"
            onPress={openDeleteConfirmation}
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <RNHostView>
            <View style={styles.contextMenuTrigger} collapsable={false}>
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
            </View>
          </RNHostView>
        </ContextMenu.Trigger>
        <ContextMenu.Preview>
          <RNHostView matchContents>
            <OwnedMediaCardPreview
              title={data.title}
              subtitle={getMetadata()}
              posterPath={data.poster_path}
              viewed={viewed}
              showPartialBadge={showPartialBadge}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
              backgroundColor={backgroundColor}
              viewedColor={colors.text}
            />
          </RNHostView>
        </ContextMenu.Preview>
      </ContextMenu>
    </Host>
  );
}

type OwnedMediaCardPreviewProps = {
  title: string;
  subtitle: string;
  posterPath?: string | null;
  viewed: boolean;
  showPartialBadge: boolean;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
  viewedColor: string;
};

function OwnedMediaCardPreview({
  title,
  subtitle,
  posterPath,
  viewed,
  showPartialBadge,
  backgroundColor,
  textColor,
  secondaryTextColor,
  viewedColor,
}: OwnedMediaCardPreviewProps) {
  return (
    <View style={styles.previewOuter}>
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor:
              backgroundColor || PlatformColor("systemBackground"),
          },
        ]}
      >
        {viewed ? (
          <View style={styles.previewViewedIndicator}>
            <Ionicons name="eye" size={11} color={viewedColor} />
          </View>
        ) : null}

        <View style={styles.previewPosterContainer}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w342/${posterPath}` }}
            alt={title}
            style={styles.poster}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
        </View>

        <View style={styles.previewTextContainer}>
          <Text
            style={[
              styles.title,
              { color: textColor || PlatformColor("label") },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: secondaryTextColor || PlatformColor("secondaryLabel") },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>

        {showPartialBadge ? (
          <View style={styles.partialBadge}>
            <Text style={styles.partialBadgeText}>
              {i18n.t("screen.detail.media.partial")}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contextMenuHost: {
    width: "100%",
    height: 121,
  },
  contextMenuTrigger: {
    width: "100%",
    height: 121,
  },
  previewOuter: {
    width: PREVIEW_WIDTH,
  },
  previewCard: {
    minHeight: 129,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "relative",
  },
  previewViewedIndicator: {
    position: "absolute",
    left: 4,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewPosterContainer: {
    width: 70,
    height: 105,
    flexShrink: 0,
    borderRadius: TOKENS.radius.lg,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  previewTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
    gap: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    lineHeight: 18,
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
