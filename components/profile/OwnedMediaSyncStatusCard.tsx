import { PlatformColor, StyleSheet, Text, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

type OwnedMediaSyncStatusCardProps = {
  syncStatus: OwnedMediaSyncStatus | null;
  compact?: boolean;
};

export default function OwnedMediaSyncStatusCard({
  syncStatus,
  compact = false,
}: OwnedMediaSyncStatusCardProps) {
  const status = syncStatus?.status || "idle";
  const isFailed = status === "failed";
  const isRunning = status === "running";

  const subtitle = getSubtitle(syncStatus);
  const badgeLabel = getBadgeLabel(syncStatus);

  return (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        { backgroundColor: PlatformColor("secondarySystemBackground") },
      ]}
    >
      <View style={styles.copyContainer}>
        <Text style={[styles.title, { color: PlatformColor("label") }]}> 
          {i18n.t(
            syncStatus?.media_type === "tv"
              ? "screen.profile.syncStatus.tvTitle"
              : "screen.profile.syncStatus.title",
          )}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.subtitle, { color: PlatformColor("secondaryLabel") }]}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          { backgroundColor: PlatformColor("tertiarySystemFill") },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.badgeText,
            {
              color: isFailed
                ? PlatformColor("systemRed")
                : isRunning
                  ? PlatformColor("systemBlue")
                  : PlatformColor("secondaryLabel"),
            },
          ]}
        >
          {badgeLabel}
        </Text>
      </View>
    </View>
  );
}

function getSubtitle(syncStatus: OwnedMediaSyncStatus | null): string {
  if (!syncStatus) {
    return i18n.t("screen.profile.syncStatus.noSync");
  }

  if (syncStatus.status === "running") {
    return i18n.t("screen.profile.syncStatus.running");
  }

  if (syncStatus.status === "failed") {
    return i18n.t("screen.profile.syncStatus.failed");
  }

  if (syncStatus.finished_at) {
    return i18n.t("screen.profile.syncStatus.success", {
      date: formatSyncDate(syncStatus.finished_at),
    });
  }

  return i18n.t("screen.profile.syncStatus.noSync");
}

function getBadgeLabel(syncStatus: OwnedMediaSyncStatus | null): string {
  if (!syncStatus) {
    return i18n.t("screen.profile.syncStatus.notSynced");
  }

  if (syncStatus.status === "running") {
    return getTriggerLabel(syncStatus.trigger);
  }

  if (syncStatus.status === "failed") {
    return i18n.t("screen.profile.syncStatus.failedBadge");
  }

  if (typeof syncStatus.owned_count === "number") {
    return i18n.t("screen.profile.syncStatus.syncedCount", {
      count: syncStatus.owned_count,
    });
  }

  return i18n.t("screen.profile.syncStatus.notSynced");
}

function getTriggerLabel(trigger: OwnedMediaSyncStatus["trigger"]): string {
  if (trigger === "scheduled") {
    return i18n.t("screen.profile.syncStatus.scheduled");
  }

  if (trigger === "manual") {
    return i18n.t("screen.profile.syncStatus.manual");
  }

  return i18n.t("screen.profile.syncStatus.runningBadge");
}

function formatSyncDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const time = date.toLocaleTimeString(i18n.locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameCalendarDay(date, now)) {
    return i18n.t("screen.profile.syncStatus.todayAt", { time });
  }

  if (isSameCalendarDay(date, yesterday)) {
    return i18n.t("screen.profile.syncStatus.yesterdayAt", { time });
  }

  return date.toLocaleString(i18n.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isSameCalendarDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 56,
    borderRadius: TOKENS.radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  compactContainer: {
    marginTop: 0,
  },
  copyContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.xl,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
    lineHeight: 17,
  },
  badge: {
    borderRadius: TOKENS.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 128,
  },
  badgeText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.sm,
    lineHeight: 15,
  },
});
