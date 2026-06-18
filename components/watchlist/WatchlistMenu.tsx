import * as Haptics from "expo-haptics";
import i18n from "@/services/i18n";
import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderMenu from "@/components/ui/HeaderMenu";

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
  const actions: HeaderMenuItem[] = SORT_OPTIONS.map((option) => ({
    id: option.value,
    title: option.label,
    selected: sortType === option.value,
    onPress: () => handlePressAction(option.value),
  }));

  const handlePressAction = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(id as SortType);
  };

  return (
    <HeaderMenu
      label={i18n.t("screen.watchlist.menu.sort")}
      icon="arrow.up.arrow.down"
      actions={actions}
    />
  );
}
