import { StyleSheet, useColorScheme } from "react-native";
import { ContextMenu, Host, Image, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";

type Genre = {
  id: number;
  name: string;
};

type GenreFilterProps = {
  genres: Genre[];
  selectedGenreId: number | null;
  onGenreChange: (genreId: number | null) => void;
};

export default function GenreFilter({
  genres,
  selectedGenreId,
  onGenreChange,
}: GenreFilterProps) {
  const isDarkMode = useColorScheme() === "dark";

  // Build options array with "All" at the beginning
  const options = [i18n.t("filter.genre.all"), ...genres.map((g) => g.name)];

  // Calculate selected index (0 for "All", index+1 for genres)
  const selectedIndex =
    selectedGenreId === null
      ? 0
      : genres.findIndex((g) => g.id === selectedGenreId) + 1;

  const handleSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (index === 0) {
      onGenreChange(null); // "All" selected
    } else {
      onGenreChange(genres[index - 1].id);
    }
  };

  return (
    <Host style={styles.container}>
      <ContextMenu
        modifiers={[
          buttonStyle(isLiquidGlassAvailable() ? "glass" : "bordered"),
        ]}
      >
        <ContextMenu.Items>
          <Picker
            selectedIndex={selectedIndex}
            options={options}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSelect(index)
            }
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Image
            systemName="list.bullet"
            size={20}
            color={
              isLiquidGlassAvailable()
                ? "primary"
                : isDarkMode
                  ? "white"
                  : "black"
            }
          />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 34,
  },
});
