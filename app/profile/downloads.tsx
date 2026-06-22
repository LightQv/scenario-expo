import { Dimensions, FlatList, PlatformColor, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ContentUnavailableView, Host } from "@expo/ui/swift-ui";
import DownloadRequestCard from "@/components/downloads/DownloadRequestCard";
import GoBackButton from "@/components/ui/GoBackButton";
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
const DOWNLOAD_POLLING_INTERVAL = 5000;

export default function DownloadsScreen() {
  const { requests, refreshRequests } = useDownloadRequestContext();
  const hasActiveRequests = requests.some((request) =>
    ACTIVE_DOWNLOAD_STATUSES.includes(request.status),
  );

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
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DownloadRequestCard data={item} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <HeaderTitle title={i18n.t("screen.downloads.title")} />
          </View>
        }
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
  header: {
    marginBottom: 18,
  },
  emptyContainer: {
    height: EMPTY_STATE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
  },
});
