import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Host, Menu, Button, Divider, RNHostView } from "@expo/ui/swift-ui";
import { BUTTON } from "@/constants/theme";

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
  return (
    <Host matchContents>
      <Menu
        label={
          <RNHostView matchContents>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel}
              activeOpacity={BUTTON.opacity}
              style={styles.container}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={textColor || "#000"}
              />
            </TouchableOpacity>
          </RNHostView>
        }
      >
        {actions.map((action) => [
          action.separatorBefore ? <Divider key={`${action.id}-divider`} /> : null,
          <Button
            key={action.id}
            label={action.label}
            role={action.destructive ? "destructive" : undefined}
            systemImage={action.systemImage as never}
            onPress={action.onPress}
          />,
        ])}
      </Menu>
    </Host>
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
