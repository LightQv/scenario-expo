import { StyleSheet, useColorScheme, View } from "react-native";
import { ContextMenu, Host, Image, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";

type SortType = "default" | "title_asc" | "title_desc" | "count_asc" | "count_desc";

type SortOption = {
  value: SortType;
  label: string;
};

type WatchlistMenuProps = {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: "Default" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "count_asc", label: "Items ↑" },
  { value: "count_desc", label: "Items ↓" },
];

export default function WatchlistMenu({
  sortType,
  onSortChange,
}: WatchlistMenuProps) {
  const colorScheme = useColorScheme();

  // Build sort options array
  const sortLabels = SORT_OPTIONS.map((s) => s.label);

  // Calculate selected sort index
  const selectedSortIndex = SORT_OPTIONS.findIndex((s) => s.value === sortType);

  const handleSortSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(SORT_OPTIONS[index].value);
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Picker
            label={i18n.t("screen.watchlist.menu.sort")}
            options={sortLabels}
            variant="menu"
            selectedIndex={selectedSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSortSelect(index)
            }
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image
                systemName="ellipsis"
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </Host>
          </View>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 28,
  },
});
