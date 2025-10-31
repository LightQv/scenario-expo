import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";

type GoBackButtonProps = {
  variant?: "back" | "close";
};

export default function GoBackButton({ variant = "back" }: GoBackButtonProps) {
  const { colors } = useThemeContext();

  const iconName = variant === "close" ? "close" : "chevron-back";
  const margin = variant === "close" ? 6 : 4;

  return (
    <Pressable onPress={() => router.back()} style={{ marginLeft: margin }}>
      <Ionicons name={iconName} size={24} color={colors.text} />
    </Pressable>
  );
}
