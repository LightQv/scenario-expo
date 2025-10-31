import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";

export default function WatchlistCreateButton() {
  const { colors } = useThemeContext();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/watchlist-create");
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Ionicons
        name="add"
        size={24}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
