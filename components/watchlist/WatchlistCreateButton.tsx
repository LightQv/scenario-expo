import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import HeaderIconButton from "@/components/ui/HeaderIconButton";

export default function WatchlistCreateButton() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/watchlist-create");
  };

  return <HeaderIconButton icon="add" onPress={handlePress} />;
}
