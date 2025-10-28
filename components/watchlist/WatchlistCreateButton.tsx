import { TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

type WatchlistCreateButtonProps = {
  onCreateWatchlist: () => void;
};

export default function WatchlistCreateButton({
  onCreateWatchlist,
}: WatchlistCreateButtonProps) {
  const colorScheme = useColorScheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/watchlist-create");
    setTimeout(() => {
      onCreateWatchlist();
    }, 500);
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
