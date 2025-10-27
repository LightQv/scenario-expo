import { Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type GoBackButtonProps = {
  variant?: "back" | "close";
};

export default function GoBackButton({ variant = "back" }: GoBackButtonProps) {
  const colorScheme = useColorScheme();

  const iconName = variant === "close" ? "close" : "chevron-back";
  const margin = variant === "close" ? 4 : 2;

  return (
    <Pressable onPress={() => router.back()} style={{ marginLeft: margin }}>
      <Ionicons
        name={iconName}
        size={28}
        color={colorScheme === "dark" ? "#fff" : "#000"}
      />
    </Pressable>
  );
}
