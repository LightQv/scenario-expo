import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BUTTON } from "@/constants/theme";

type AddToWatchlistButtonProps = {
  tmdbId: string;
  mediaType: string;
  title: string;
};

export default function AddToWatchlistButton({
  tmdbId,
  mediaType,
  title,
}: AddToWatchlistButtonProps) {
  const handlePress = () => {
    router.push({
      pathname: "/(modal)/watchlist-add",
      params: { tmdbId, mediaType, title },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={BUTTON.opacity}>
      <Ionicons name="add" size={24} color="#fff" />
    </TouchableOpacity>
  );
}
