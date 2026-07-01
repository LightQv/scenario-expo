import {
  PlatformColor,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BLURHASH, BUTTON, FONTS, TOKENS } from "@/constants/theme";
import { useDownloadRequestContext, useThemeContext } from "@/contexts";
import { prefetchDetailPaletteFromImage } from "@/services/detailPalette";
import i18n from "@/services/i18n";

const TMDB_ORIGINAL_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const ACTIVE_DOWNLOAD_STATUSES: DownloadRequestStatus[] = [
  "requested",
  "sent_to_radarr",
  "searching",
  "downloading",
];
const RETRYABLE_DOWNLOAD_STATUSES: DownloadRequestStatus[] = [
  "failed",
  "not_found",
  "cancelled",
];

type DownloadRequestCardProps = {
  data: DownloadRequest;
};

export default function DownloadRequestCard({ data }: DownloadRequestCardProps) {
  const { retryRequest, cancelRequest } = useDownloadRequestContext();
  const { isDark } = useThemeContext();
  const statusColor = getStatusColor(data.status);
  const statusBackgroundColor = getStatusBackgroundColor(data.status);
  const queueSummary = getQueueSummary(data);
  const queueDetails = getQueueDetails(data);
  const scopeLabel = getScopeLabel(data);
  const statusLabel = getStatusLabel(data);
  const progress = getProgress(data);
  const canCancel = ACTIVE_DOWNLOAD_STATUSES.includes(data.status);
  const canRetry = RETRYABLE_DOWNLOAD_STATUSES.includes(data.status);
  const action = canRetry
    ? {
        icon: "refresh" as const,
        label: i18n.t("screen.downloads.actions.retry"),
        onPress: () => retryRequest(data.id),
      }
    : canCancel
      ? {
          icon: "close" as const,
          label: i18n.t("screen.downloads.actions.cancel"),
          onPress: () => cancelRequest(data.id),
        }
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Link
          href={{
            pathname: "/details/[id]",
            params: { type: data.media_type, id: data.tmdb_id.toString() },
          }}
          asChild
          push
          prefetch
        >
          <TouchableOpacity
            activeOpacity={BUTTON.opacity}
            onPressIn={() =>
              prefetchDetailPaletteFromImage(
                data.poster_path
                  ? `${TMDB_ORIGINAL_IMAGE_BASE_URL}/${data.poster_path}`
                  : undefined,
                isDark,
              )
            }
            style={styles.mainContent}
          >
            <View style={styles.posterContainer}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342/${data.poster_path}` }}
                alt={data.title}
                style={styles.poster}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {data.title}
              </Text>
              <Text style={styles.scope} numberOfLines={1}>
                {scopeLabel} · {data.source === "SONARR" ? "Sonarr" : "Radarr"}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: statusBackgroundColor,
                      borderColor: statusColor,
                    },
                  ]}
                >
                  <Ionicons name={getStatusIcon(data.status)} size={13} color={statusColor} />
                  <Text style={[styles.status, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
                {!!queueSummary && (
                  <Text style={styles.quality} numberOfLines={1}>
                    {queueSummary}
                  </Text>
                )}
              </View>
              {progress !== null && (
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%`, backgroundColor: statusColor },
                    ]}
                  />
                </View>
              )}
              {!!queueDetails && (
                <Text style={styles.queueDetails} numberOfLines={1}>
                  {queueDetails}
                </Text>
              )}
              {!!data.error_message && (
                <Text style={styles.error} numberOfLines={2}>
                  {data.error_message}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </Link>
        {!!action && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={action.label}
            activeOpacity={BUTTON.opacity}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <Ionicons
              name={action.icon}
              size={18}
              color={PlatformColor("label")}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function getStatusIcon(status: DownloadRequestStatus): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case "available":
      return "checkmark-circle";
    case "downloading":
      return "arrow-down-circle";
    case "failed":
    case "not_found":
      return "alert-circle";
    case "cancelled":
      return "close-circle";
    default:
      return "time";
  }
}

function getQueueSummary(data: DownloadRequest) {
  return data.quality || null;
}

function getQueueDetails(data: DownloadRequest) {
  const parts = [
    data.download_client,
    data.status === "available"
      ? formatSize(data.size)
      : formatRemainingSize(data.size_left),
    data.time_left,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function getScopeLabel(data: DownloadRequest) {
  if (data.scope === "season") {
    return i18n.t("screen.downloads.scope.seasonDownload", {
      season: data.season_number ?? "-",
    });
  }

  if (data.scope === "episode") {
    return i18n.t("screen.downloads.scope.episodeDownload", {
      season: data.season_number ?? "-",
      episode: data.episode_number ?? "-",
    });
  }

  return i18n.t(`screen.downloads.scope.${data.scope}Download`);
}

function getStatusLabel(data: DownloadRequest) {
  if (data.media_type !== "tv") {
    return i18n.t(`screen.downloads.status.${data.status}`);
  }

  const scopeKey =
    data.scope === "season"
      ? "season"
      : data.scope === "episode"
        ? "episode"
        : "series";
  return i18n.t(`screen.downloads.statusScoped.${data.status}.${scopeKey}`);
}

function formatSize(size?: number | null) {
  if (!size || size <= 0) return null;

  const gigabytes = size / 1024 / 1024 / 1024;
  if (gigabytes >= 1) return `${gigabytes.toFixed(1)} GB`;

  const megabytes = size / 1024 / 1024;
  return `${Math.max(1, Math.round(megabytes))} MB`;
}

function formatRemainingSize(sizeLeft?: number | null) {
  const size = formatSize(sizeLeft);
  if (!size) return null;

  return i18n.t("screen.downloads.remaining", {
    size,
  });
}

function getProgress(data: DownloadRequest) {
  if (!data.size || data.size_left === null || data.size_left === undefined) return null;
  if (data.size <= 0) return null;
  const progress = ((data.size - data.size_left) / data.size) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

function getStatusColor(status: DownloadRequestStatus) {
  switch (status) {
    case "available":
      return PlatformColor("systemGreen");
    case "searching":
    case "downloading":
      return PlatformColor("systemBlue");
    case "failed":
      return PlatformColor("systemRed");
    case "not_found":
    case "requested":
    case "sent_to_radarr":
      return PlatformColor("systemOrange");
    case "cancelled":
      return PlatformColor("secondaryLabel");
    default:
      return PlatformColor("systemOrange");
  }
}

function getStatusBackgroundColor(status: DownloadRequestStatus) {
  switch (status) {
    case "available":
      return "rgba(52, 199, 89, 0.14)";
    case "searching":
    case "downloading":
      return "rgba(0, 122, 255, 0.14)";
    case "failed":
      return "rgba(255, 59, 48, 0.14)";
    case "not_found":
    case "requested":
    case "sent_to_radarr":
      return "rgba(255, 149, 0, 0.14)";
    case "cancelled":
      return "rgba(142, 142, 147, 0.14)";
    default:
      return "rgba(255, 149, 0, 0.14)";
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: TOKENS.margin.horizontal,
  },
  posterContainer: {
    width: 70,
    height: 105,
    borderRadius: TOKENS.radius.sm,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 4,
    gap: 5,
  },
  title: {
    color: PlatformColor("label"),
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderRadius: TOKENS.radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  status: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.bold,
  },
  quality: {
    flex: 1,
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.medium,
  },
  scope: {
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.medium,
    lineHeight: 16,
  },
  queueDetails: {
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  progressTrack: {
    height: 4,
    borderRadius: TOKENS.radius.full,
    backgroundColor: PlatformColor("systemGray5"),
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: TOKENS.radius.full,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
});
