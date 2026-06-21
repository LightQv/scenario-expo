import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderMenu from "@/components/ui/HeaderMenu";

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
  watchlistType?: string;
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
  watchlistType,
  sortType,
  filterType,
  onSortChange,
  onFilterChange,
  onDelete,
}: WatchlistDetailMenuProps) {
  const isSystemWatchlist = watchlistType === "SYSTEM";

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

  const handlePressAction = (id: string) => {
    const [kind, value] = id.split(":");

    if (id === "edit") {
      handleEdit();
      return;
    }

    if (id === "delete") {
      openDeleteConfirmation();
      return;
    }

    if (!value) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (kind === "filter") {
      onFilterChange(value as FilterType);
    }

    if (kind === "sort") {
      onSortChange(value as SortType);
    }
  };

  const actions: HeaderMenuItem[] = [
    {
      id: "filter",
      title: i18n.t("screen.watchlist.detail.menu.filter"),
      icon: "line.3.horizontal.decrease",
      children: FILTER_OPTIONS.map((option) => ({
        id: `filter:${option.value}`,
        title: option.label,
        selected: filterType === option.value,
        onPress: () => handlePressAction(`filter:${option.value}`),
      })),
    },
    {
      id: "sort",
      title: i18n.t("screen.watchlist.detail.menu.sort"),
      icon: "arrow.up.arrow.down",
      children: SORT_OPTIONS.map((option) => ({
        id: `sort:${option.value}`,
        title: option.label,
        selected: sortType === option.value,
        onPress: () => handlePressAction(`sort:${option.value}`),
      })),
    },
    ...(!isSystemWatchlist
      ? [
          {
            id: "edit",
            title: i18n.t("form.watchlist.edit.title"),
            icon: "pencil",
            onPress: handleEdit,
          } satisfies HeaderMenuItem,
          {
            id: "delete",
            title: i18n.t("form.watchlist.delete.title"),
            icon: "trash",
            destructive: true,
            onPress: openDeleteConfirmation,
          } satisfies HeaderMenuItem,
        ]
      : []),
  ];

  return (
    <HeaderMenu label="Watchlist actions" actions={actions} />
  );
}
