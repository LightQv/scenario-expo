import { StyleSheet, useColorScheme, View, Alert } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";

type WatchlistDetailMenuProps = {
  watchlistId: string;
  onDelete: () => void;
};

export default function WatchlistDetailMenu({
  watchlistId,
  onDelete,
}: WatchlistDetailMenuProps) {
  const colorScheme = useColorScheme();

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-edit",
      params: { id: watchlistId },
    });
  };

  const openDeleteConfirmation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      i18n.t("form.watchlist.delete.title"),
      i18n.t("form.watchlist.delete.warning"),
      [
        {
          text: i18n.t("form.watchlist.delete.submit"),
          onPress: handleDelete,
          style: "destructive",
        },
        {
          text: i18n.t("form.watchlist.delete.cancel"),
          style: "cancel",
        },
      ],
    );
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/watchlists/${watchlistId}`, {
        method: "DELETE",
      });
      onDelete();
      router.back();
    } catch (err: any) {
      console.error("Error deleting watchlist:", err);
      if (!err.message?.includes("403")) {
        notifyError(i18n.t("toast.error"));
      }
    }
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Button onPress={handleEdit} systemImage="pencil">
            {i18n.t("form.watchlist.edit.title")}
          </Button>
          <Button
            onPress={openDeleteConfirmation}
            systemImage="trash"
            role="destructive"
          >
            {i18n.t("form.watchlist.delete.title")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image
                systemName="ellipsis"
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Host>
          </View>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 28,
  },
});
