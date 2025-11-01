import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useThemeContext } from "@/contexts/ThemeContext";
import { BUTTON, TOKENS } from "@/constants/theme";

export default function WatchlistCreateButton() {
  const { colors } = useThemeContext();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/watchlist-create");
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={BUTTON.opacity}>
      <Ionicons
        name="add"
        size={TOKENS.icon}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
