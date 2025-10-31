import { TouchableOpacity, StyleSheet, PlatformColor } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME_COLORS } from "@/constants/theme";

type FormSubmitHeaderButtonProps = {
  onPress: () => void;
  disabled: boolean;
};

export default function FormSubmitHeaderButton({
  onPress,
  disabled,
}: FormSubmitHeaderButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={styles.button}
      activeOpacity={0.6}
    >
      <Ionicons
        name="checkmark"
        size={24}
        color={disabled ? PlatformColor("systemGray") : THEME_COLORS.main}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingLeft: 6,
  },
});
