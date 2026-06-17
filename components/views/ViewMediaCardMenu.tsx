import { StyleSheet } from "react-native";
import { Button, ContextMenu, Host } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useViewContext } from "@/contexts/ViewContext";

type ViewMediaCardMenuProps = {
  viewId: string;
  onDelete?: (id: string) => void;
};

export default function ViewMediaCardMenu({
  viewId,
  onDelete,
}: ViewMediaCardMenuProps) {
  const { colors } = useThemeContext();
  const { removeView } = useViewContext();

  const handleUnview = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await removeView(viewId);

      // Call the onDelete callback to remove from local state
      if (onDelete) {
        onDelete(viewId);
      }
    } catch (err) {
      console.error("Error removing view:", err);
      // Error is already handled in removeView
    }
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          <Button
            onPress={handleUnview}
            systemImage="eye.slash"
            role="destructive"
          >
            {i18n.t("screen.watchlist.detail.menu.unview")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button systemImage="ellipsis" color={colors.text} />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 34,
  },
});
