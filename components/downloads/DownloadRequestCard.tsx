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
import { useDownloadRequestContext } from "@/contexts";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";

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
  const statusColor = getStatusColor(data.status);
  const queueSummary = getQueueSummary(data);
  const queueDetails = getQueueDetails(data);
  const progress = getProgress(data);
  const canCancel = ACTIVE_DOWNLOAD_STATUSES.includes(data.status);
  const canRetry = RETRYABLE_DOWNLOAD_STATUSES.includes(data.status);

  return (
    <View style={styles.container}>
      <Link
        href={{
          pathname: "/details/[id]",
          params: { type: data.media_type, id: data.tmdb_id.toString() },
        }}
        asChild
        push
      >
        <TouchableOpacity activeOpacity={BUTTON.opacity} style={styles.content}>
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
            <Text style={styles.title} numberOfLines={2}>
              {data.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {formatFullDate(data.release_date)} • {formatRuntime(data.runtime)}
            </Text>
            <View style={styles.statusRow}>
              <Ionicons name={getStatusIcon(data.status)} size={14} color={statusColor} />
              <Text style={[styles.status, { color: statusColor }]}>
                {i18n.t(`screen.downloads.status.${data.status}`)}
                {!!queueSummary && ` · ${queueSummary}`}
              </Text>
            </View>
            {!!queueDetails && (
              <Text style={styles.queueDetails} numberOfLines={1}>
                {queueDetails}
              </Text>
            )}
            {progress !== null && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            )}
            {!!data.error_message && (
              <Text style={styles.error} numberOfLines={2}>
                {data.error_message}
              </Text>
            )}
            {(canCancel || canRetry) && (
              <View style={styles.actionRow}>
                {canRetry && (
                  <TouchableOpacity
                    activeOpacity={BUTTON.opacity}
                    style={styles.actionButton}
                    onPress={() => retryRequest(data.id)}
                  >
                    <Text style={styles.actionButtonText}>
                      {i18n.t("screen.downloads.actions.retry")}
                    </Text>
                  </TouchableOpacity>
                )}
                {canCancel && (
                  <TouchableOpacity
                    activeOpacity={BUTTON.opacity}
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => cancelRequest(data.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                      {i18n.t("screen.downloads.actions.cancel")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Link>
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
  const parts = [data.download_client, formatRemainingSize(data.size_left)].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function formatRemainingSize(sizeLeft?: number | null) {
  if (!sizeLeft || sizeLeft <= 0) return null;

  const gigabytes = sizeLeft / 1024 / 1024 / 1024;
  if (gigabytes >= 1) {
    return i18n.t("screen.downloads.remaining", {
      size: `${gigabytes.toFixed(1)} GB`,
    });
  }

  const megabytes = sizeLeft / 1024 / 1024;
  return i18n.t("screen.downloads.remaining", {
    size: `${Math.max(1, Math.round(megabytes))} MB`,
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
    case "failed":
    case "not_found":
      return PlatformColor("systemRed");
    case "cancelled":
      return PlatformColor("secondaryLabel");
    default:
      return PlatformColor("systemOrange");
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: TOKENS.margin.horizontal,
    paddingRight: 8,
  },
  posterContainer: {
    width: 70,
    height: 105,
    borderRadius: TOKENS.radius.sm,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
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
  subtitle: {
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  status: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.medium,
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
    backgroundColor: PlatformColor("systemOrange"),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: TOKENS.radius.full,
    backgroundColor: PlatformColor("systemGray5"),
  },
  cancelButton: {
    backgroundColor: PlatformColor("systemRed"),
  },
  actionButtonText: {
    color: PlatformColor("label"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.medium,
  },
  cancelButtonText: {
    color: "#fff",
  },
  error: {
    color: PlatformColor("secondaryLabel"),
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
});
