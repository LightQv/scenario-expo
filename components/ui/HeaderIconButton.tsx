import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BUTTON, TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";

type HeaderIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export default function HeaderIconButton({
  icon,
  active = false,
  disabled = false,
  onPress,
}: HeaderIconButtonProps) {
  const { colors } = useThemeContext();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: BUTTON.opacity },
      ]}
      disabled={disabled}
      hitSlop={8}
    >
      <Ionicons
        name={icon}
        size={TOKENS.header.icon}
        color={active ? colors.main : colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 26,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
});
