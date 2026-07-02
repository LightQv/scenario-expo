import type { ComponentProps, ReactNode } from "react";
import { ColorValue, StyleSheet, View } from "react-native";
import {
  Button as NativeButton,
  ContextMenu,
  Host,
  RNHostView,
} from "@expo/ui/swift-ui";
import CompactMediaCardPreview from "@/components/ui/CompactMediaCardPreview";

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
  };
};

export default function CompactMediaContextMenu({
  actions,
  trigger,
  preview,
}: CompactMediaContextMenuProps) {
  return (
    <Host style={styles.contextMenuHost}>
      <ContextMenu>
        <ContextMenu.Items>
          {actions.map((action) => (
            <NativeButton
              key={action.id}
              label={action.label}
              systemImage={action.systemImage}
              role={action.destructive ? "destructive" : undefined}
              onPress={action.onPress}
            />
          ))}
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <RNHostView>
            <View style={styles.contextMenuTrigger} collapsable={false}>
              {trigger}
            </View>
          </RNHostView>
        </ContextMenu.Trigger>
        <ContextMenu.Preview>
          <RNHostView matchContents>
            <CompactMediaCardPreview {...preview} />
          </RNHostView>
        </ContextMenu.Preview>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  contextMenuHost: {
    width: "100%",
    height: 121,
  },
  contextMenuTrigger: {
    width: "100%",
    height: 121,
  },
});
