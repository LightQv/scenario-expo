import type { ComponentProps, ReactNode } from "react";
import { ColorValue, StyleSheet } from "react-native";
import { Button as NativeButton } from "@expo/ui/swift-ui";
import ScenarioContextMenu from "scenario-context-menu";

export type CompactMediaContextMenuAction = {
  id: string;
  label: string;
  systemImage: ComponentProps<typeof NativeButton>["systemImage"];
  destructive?: boolean;
  onPress: () => void;
};

type CompactMediaContextMenuProps = {
  actions: CompactMediaContextMenuAction[];
  trigger: ReactNode;
  preview: {
    title: string;
    subtitle: string;
    posterPath?: string | null;
    backgroundColor?: ColorValue;
    textColor?: string;
    secondaryTextColor?: string;
    leadingAccessory?: ReactNode;
    trailingAccessory?: ReactNode;
    viewed?: boolean;
    badgeLabel?: string;
  };
};

export default function CompactMediaContextMenu({
  actions,
  trigger,
  preview,
}: CompactMediaContextMenuProps) {
  return (
    <ScenarioContextMenu
      actions={actions.map((action) => ({
        id: action.id,
        label: action.label,
        systemImage: action.systemImage,
        destructive: action.destructive,
      }))}
      preview={{
        title: preview.title,
        subtitle: preview.subtitle,
        posterPath: preview.posterPath,
        viewed: preview.viewed,
        badgeLabel: preview.badgeLabel,
      }}
      onAction={(actionId) => {
        actions.find((action) => action.id === actionId)?.onPress();
      }}
      style={styles.contextMenuHost}
    >
      {trigger}
    </ScenarioContextMenu>
  );
}

const styles = StyleSheet.create({
  contextMenuHost: {
    width: "100%",
    height: 121,
  },
});
