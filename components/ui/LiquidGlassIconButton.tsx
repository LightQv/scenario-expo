import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Host, Image as SwiftUIImage } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { Ionicons } from "@expo/vector-icons";
import { BUTTON, TOKENS } from "@/constants/theme";

type LiquidGlassIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  systemImage: string;
  active?: boolean;
  onPress: () => void;
  tintColor: string;
  textColor: string;
  fallbackBackgroundColor: string;
  fallbackBorderColor: string;
  size?: number;
};

export default function LiquidGlassIconButton({
  icon,
  systemImage,
  active = false,
  onPress,
  tintColor,
  textColor,
  fallbackBackgroundColor,
  fallbackBorderColor,
  size = 56,
}: LiquidGlassIconButtonProps) {
  if (Platform.OS === "ios") {
    return (
      <Host
        style={[styles.host, { width: size, height: size }]}
        colorScheme="dark"
      >
        <Button
          onPress={onPress}
          modifiers={[
            frame({ width: size, height: size }),
            controlSize("large"),
            buttonBorderShape("circle"),
            buttonStyle(active ? "glassProminent" : "glass"),
            tint(tintColor),
          ]}
        >
          <SwiftUIImage
            systemName={systemImage as never}
            size={22}
            color={textColor}
          />
        </Button>
      </Host>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={BUTTON.opacity}
      onPress={onPress}
      style={[styles.fallbackWrapper, { width: size, height: size }]}
    >
      <View
        style={[
          styles.fallbackButton,
          {
            backgroundColor: fallbackBackgroundColor,
            borderColor: fallbackBorderColor,
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={textColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  host: {
    borderRadius: TOKENS.radius.full,
    overflow: "hidden",
  },
  fallbackWrapper: {
    borderRadius: TOKENS.radius.full,
    overflow: "hidden",
  },
  fallbackButton: {
    width: "100%",
    height: "100%",
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
});
