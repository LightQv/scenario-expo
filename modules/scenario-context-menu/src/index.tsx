import type { ReactNode } from "react";
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { requireNativeViewManager } from "expo-modules-core";

export type ScenarioContextMenuAction = {
  id: string;
  label: string;
  systemImage?: string;
  destructive?: boolean;
};

export type ScenarioContextMenuPreview = {
  title: string;
  subtitle: string;
  posterPath?: string | null;
  viewed?: boolean;
  badgeLabel?: string;
};

type ActionEvent = NativeSyntheticEvent<{ actionId: string }>;

type NativeScenarioContextMenuProps = {
  actions: ScenarioContextMenuAction[];
  preview: ScenarioContextMenuPreview;
  onAction?: (event: ActionEvent) => void;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

type ScenarioContextMenuProps = Omit<NativeScenarioContextMenuProps, "onAction"> & {
  onAction?: (actionId: string) => void;
};

const NativeScenarioContextMenu =
  requireNativeViewManager<NativeScenarioContextMenuProps>("ScenarioContextMenu");

export default function ScenarioContextMenu({
  actions,
  preview,
  onAction,
  style,
  children,
}: ScenarioContextMenuProps) {
  return (
    <NativeScenarioContextMenu
      actions={actions}
      preview={preview}
      onAction={(event) => onAction?.(event.nativeEvent.actionId)}
      style={[styles.container, style]}
    >
      {children}
    </NativeScenarioContextMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
