import { TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

export default function WatchlistCreateButton() {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/watchlist-create");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ marginLeft: 4 }}
    >
      <Ionicons
        name="add"
        size={28}
        color={colorScheme === "dark" ? "#fff" : "#000"}
      />
    </TouchableOpacity>
  );
}
