import { StyleSheet, View, Alert } from "react-native";
import { Button, ContextMenu, Host, Image, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import { useThemeContext } from "@/contexts/ThemeContext";

type SortType =
  | "default"
  | "title_asc"
  | "title_desc"
  | "date_asc"
  | "date_desc";
type FilterType = "all" | "movie" | "tv";

type SortOption = {
  value: SortType;
  label: string;
};

type FilterOption = {
  value: FilterType;
  label: string;
};

type WatchlistDetailMenuProps = {
  watchlistId: string;
  sortType: SortType;
  filterType: FilterType;
  onSortChange: (sort: SortType) => void;
  onFilterChange: (filter: FilterType) => void;
  onDelete: () => void;
};

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: i18n.t("screen.watchlist.detail.sort.default") },
  {
    value: "title_asc",
    label: i18n.t("screen.watchlist.detail.sort.titleAsc"),
  },
  {
    value: "title_desc",
    label: i18n.t("screen.watchlist.detail.sort.titleDesc"),
  },
  { value: "date_asc", label: i18n.t("screen.watchlist.detail.sort.dateAsc") },
  {
    value: "date_desc",
    label: i18n.t("screen.watchlist.detail.sort.dateDesc"),
  },
];

const FILTER_OPTIONS: FilterOption[] = [
  { value: "all", label: i18n.t("screen.watchlist.detail.filter.all") },
  { value: "movie", label: i18n.t("screen.watchlist.detail.filter.movie") },
  { value: "tv", label: i18n.t("screen.watchlist.detail.filter.tv") },
];

export default function WatchlistDetailMenu({
  watchlistId,
  sortType,
  filterType,
  onSortChange,
  onFilterChange,
  onDelete,
}: WatchlistDetailMenuProps) {
  const { colors } = useThemeContext();

  // Build option arrays
  const sortLabels = SORT_OPTIONS.map((s) => s.label);
  const filterLabels = FILTER_OPTIONS.map((f) => f.label);

  // Calculate selected indices
  const selectedSortIndex = SORT_OPTIONS.findIndex((s) => s.value === sortType);
  const selectedFilterIndex = FILTER_OPTIONS.findIndex(
    (f) => f.value === filterType,
  );

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-edit",
      params: { id: watchlistId },
    });
  };

  const openDeleteConfirmation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      i18n.t("form.watchlist.delete.title"),
      i18n.t("form.watchlist.delete.warning"),
      [
        {
          text: i18n.t("form.watchlist.delete.submit"),
          onPress: handleDelete,
          style: "destructive",
        },
        {
          text: i18n.t("form.watchlist.delete.cancel"),
          style: "cancel",
        },
      ],
    );
  };

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/v1/watchlists/${watchlistId}`, {
        method: "DELETE",
      });
      onDelete();
      router.back();
    } catch (err: any) {
      console.error("Error deleting watchlist:", err);
      if (!err.message?.includes("403")) {
        notifyError(i18n.t("toast.error"));
      }
    }
  };

  const handleSortSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(SORT_OPTIONS[index].value);
  };

  const handleFilterSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFilterChange(FILTER_OPTIONS[index].value);
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Picker
            label={i18n.t("screen.watchlist.detail.menu.sort")}
            options={sortLabels}
            variant="menu"
            selectedIndex={selectedSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSortSelect(index)
            }
          />
          <Picker
            label={i18n.t("screen.watchlist.detail.menu.filter")}
            options={filterLabels}
            variant="menu"
            selectedIndex={selectedFilterIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleFilterSelect(index)
            }
          />
          <Button onPress={handleEdit} systemImage="pencil">
            {i18n.t("form.watchlist.edit.title")}
          </Button>
          <Button
            onPress={openDeleteConfirmation}
            systemImage="trash"
            role="destructive"
          >
            {i18n.t("form.watchlist.delete.title")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image
                systemName="ellipsis"
                color={colors.text}
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
