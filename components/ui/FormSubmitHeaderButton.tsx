import { TouchableOpacity, StyleSheet, PlatformColor } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BUTTON, TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";

type FormSubmitHeaderButtonProps = {
  onPress: () => void;
  disabled: boolean;
};

export default function FormSubmitHeaderButton({
  onPress,
  disabled,
}: FormSubmitHeaderButtonProps) {
  const { colors } = useThemeContext();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.button}
      activeOpacity={BUTTON.opacity}
    >
      <Ionicons
        name="checkmark"
        size={TOKENS.icon}
        color={disabled ? PlatformColor("systemGray") : colors.main}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingLeft: 6,
  },
});
