import { StyleSheet } from "react-native";
import { Button, ContextMenu, Host, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "count_asc"
  | "count_desc";

type SortOption = {
  value: SortType;
  label: string;
};

type WatchlistMenuProps = {
  sortType: SortType;
  onSortChange: (sort: SortType) => void;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: i18n.t("screen.watchlist.sort.default") },
  { value: "title_asc", label: i18n.t("screen.watchlist.sort.titleAsc") },
  { value: "title_desc", label: i18n.t("screen.watchlist.sort.titleDesc") },
  { value: "count_asc", label: i18n.t("screen.watchlist.sort.itemsAsc") },
  { value: "count_desc", label: i18n.t("screen.watchlist.sort.itemsDesc") },
];

export default function WatchlistMenu({
  sortType,
  onSortChange,
}: WatchlistMenuProps) {
  const { colors } = useThemeContext();

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
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          <Picker
            label={i18n.t("screen.watchlist.menu.sort")}
            options={sortLabels}
            variant="inline"
            selectedIndex={selectedSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSortSelect(index)
            }
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Button
            systemImage="arrow.up.arrow.down"
            color={colors.text}
            variant="plain"
          />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 26,
    width: 20,
  },
});
