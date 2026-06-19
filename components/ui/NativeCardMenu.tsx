import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import type { AlertButton } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";

export type NativeCardMenuAction = {
  id: string;
  label: string;
  systemImage: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onPress: () => void;
};

type NativeCardMenuProps = {
  accessibilityLabel: string;
  actions: NativeCardMenuAction[];
  textColor?: string;
};

export default function NativeCardMenu({
  accessibilityLabel,
  actions,
  textColor,
}: NativeCardMenuProps) {
  const openMenu = () => {
    const actionButtons: AlertButton[] = actions.map(
      (action): AlertButton => ({
        text: action.label,
        onPress: action.onPress,
        style: action.destructive ? ("destructive" as const) : undefined,
      }),
    );
    const alertActions: AlertButton[] = [
      ...actionButtons,
      {
        text: i18n.t("form.watchlist.cancel"),
        style: "cancel" as const,
      },
    ];

    Alert.alert(
      "",
      "",
      alertActions,
    );
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={BUTTON.opacity}
      onPress={openMenu}
      style={styles.container}
    >
      <Ionicons
        name="ellipsis-horizontal"
        size={18}
        color={textColor || "#000"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
