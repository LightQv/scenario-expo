import { StyleSheet } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { CONFIG } from "@/services/config";
import { notifySuccess, notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";

type DetailsActionsMenuProps = {
  mediaType: string;
  tmdbId: string;
  title: string;
};

export default function DetailsActionsMenu({
  mediaType,
  tmdbId,
  title,
}: DetailsActionsMenuProps) {
  const handleCopy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const url = `${CONFIG.webClientUrl}/details/${mediaType}/${tmdbId}`;
      await Clipboard.setStringAsync(url);
      notifySuccess(i18n.t("toast.success.urlCopied"));
    } catch (error) {
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleAddToWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-add",
      params: { tmdbId, mediaType, title },
    });
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          <Button onPress={handleCopy} systemImage="doc.on.doc">
            {i18n.t("screen.detail.actions.copy")}
          </Button>
          <Button onPress={handleAddToWatchlist} systemImage="plus.square.on.square">
            {i18n.t("screen.detail.actions.addToWatchlist")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Image systemName="ellipsis" />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 26,
    width: 20,
    marginLeft: 8,
  },
});
