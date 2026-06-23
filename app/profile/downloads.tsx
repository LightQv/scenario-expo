import { Alert, Dimensions, FlatList, PlatformColor, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ContentUnavailableView, Host } from "@expo/ui/swift-ui";
import DownloadRequestCard from "@/components/downloads/DownloadRequestCard";
import GoBackButton from "@/components/ui/GoBackButton";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import HeaderTitle from "@/components/ui/HeaderTitle";
import { TOKENS } from "@/constants/theme";
import { useDownloadRequestContext } from "@/contexts";
import i18n from "@/services/i18n";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CONTENT_TOP_PADDING = 200;
const CONTENT_BOTTOM_PADDING = 86;
const HEADER_BLOCK_HEIGHT = 80;
const EMPTY_STATE_HEIGHT =
  Math.max(
    240,
    SCREEN_HEIGHT -
      CONTENT_TOP_PADDING -
      CONTENT_BOTTOM_PADDING -
      HEADER_BLOCK_HEIGHT,
  );
const ACTIVE_DOWNLOAD_STATUSES: DownloadRequestStatus[] = [
  "requested",
  "sent_to_radarr",
  "searching",
  "downloading",
];
const TERMINAL_DOWNLOAD_STATUSES: DownloadRequestStatus[] = [
  "available",
  "failed",
  "not_found",
  "cancelled",
];
const DOWNLOAD_POLLING_INTERVAL = 5000;

export default function DownloadsScreen() {
  const { requests, refreshRequests, cleanRequests, cancelAllRequests } = useDownloadRequestContext();
  const hasActiveRequests = requests.some((request) =>
    ACTIVE_DOWNLOAD_STATUSES.includes(request.status),
  );
  const hasTerminalRequests = requests.some((request) =>
    TERMINAL_DOWNLOAD_STATUSES.includes(request.status),
  );

  const handleCancelAllPress = useCallback(() => {
    Alert.alert(
      i18n.t("screen.downloads.confirmCancelAll.title"),
      i18n.t("screen.downloads.confirmCancelAll.body"),
      [
        {
          text: i18n.t("screen.downloads.confirmCancelAll.keep"),
          style: "cancel",
        },
        {
          text: i18n.t("screen.downloads.confirmCancelAll.confirm"),
          style: "destructive",
          onPress: () => {
            cancelAllRequests();
          },
        },
      ],
    );
  }, [cancelAllRequests]);

  useFocusEffect(
    useCallback(() => {
      refreshRequests();

      if (!hasActiveRequests) return;

      const interval = setInterval(() => {
        refreshRequests();
      }, DOWNLOAD_POLLING_INTERVAL);

      return () => clearInterval(interval);
    }, [hasActiveRequests, refreshRequests]),
  );

  return (
    <View style={styles.container}>
      <GoBackButton />
      <HeaderActionCapsule
        actions={[
          {
            id: "downloads-actions",
            icon: "ellipsis",
            label: i18n.t("screen.downloads.actions.more"),
            menu: [
              {
                id: "clean-downloads",
                title: i18n.t("screen.downloads.actions.clean"),
                icon: "trash",
                disabled: !hasTerminalRequests,
                onPress: cleanRequests,
              },
              {
                id: "cancel-all-downloads",
                title: i18n.t("screen.downloads.actions.cancelAll"),
                icon: "xmark.circle",
                destructive: true,
                disabled: !hasActiveRequests,
                onPress: handleCancelAllPress,
              },
            ],
          },
        ]}
      />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DownloadRequestCard data={item} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<HeaderTitle title={i18n.t("screen.downloads.title")} />}
        ListEmptyComponent={
          <Host style={styles.emptyContainer}>
            <ContentUnavailableView
              systemImage="tray.and.arrow.down"
              title={i18n.t("screen.downloads.emptyState.title")}
              description={i18n.t("screen.downloads.emptyState.body")}
            />
          </Host>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  content: {
    paddingTop: CONTENT_TOP_PADDING,
    paddingBottom: CONTENT_BOTTOM_PADDING,
  },
  emptyContainer: {
    height: EMPTY_STATE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
  },
});
