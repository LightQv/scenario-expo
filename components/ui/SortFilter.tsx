import { StyleSheet, useColorScheme } from "react-native";
import {
  ContextMenu,
  Host,
  Image,
  Picker,
} from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";

export type SortOption = {
  value: string;
  label: string;
};

type SortFilterProps = {
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
};

export default function SortFilter({
  sortOptions,
  selectedSort,
  onSortChange,
}: SortFilterProps) {
  const isDarkMode = useColorScheme() === "dark";

  // Build options array
  const options = sortOptions.map((s) => s.label);

  // Calculate selected index
  const selectedIndex = sortOptions.findIndex((s) => s.value === selectedSort);

  const handleSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(sortOptions[index].value);
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
            systemName="arrow.up.arrow.down"
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
