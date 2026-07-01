import * as Haptics from "expo-haptics";
import i18n from "@/services/i18n";
import { useGenreContext } from "@/contexts/GenreContext";
import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderMenu from "@/components/ui/HeaderMenu";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";

type SortOption = {
  value: SortType;
  label: string;
};

type ViewHeaderMenuProps = {
  mediaType: string;
  sortType: SortType;
  genreId: number | null;
  onSortChange: (sort: SortType) => void;
  onGenreChange: (genreId: number | null) => void;
};

const SORT_OPTIONS: SortOption[] = [
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

export default function ViewHeaderMenu({
  mediaType,
  sortType,
  genreId,
  onSortChange,
  onGenreChange,
}: ViewHeaderMenuProps) {
  const { movieGenres, tvGenres } = useGenreContext();

  // Get genres based on media type
  const genres = mediaType === "movie" ? movieGenres : tvGenres;

  // Build genre options with "All" at the beginning
  const genreOptions = [
    { id: null, name: i18n.t("filter.genre.all") },
    ...(genres || []),
  ];

  const actions: HeaderMenuItem[] = [
    {
      id: "genre",
      title: i18n.t("filter.genre.title"),
      icon: "tag",
      children: genreOptions.map((option) => ({
        id: `genre:${option.id ?? "all"}`,
        title: option.name,
        selected: genreId === option.id,
        onPress: () => handlePressAction(`genre:${option.id ?? "all"}`),
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
  ];

  const handlePressAction = (id: string) => {
    const [kind, value] = id.split(":");
    if (!value) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (kind === "genre") {
      onGenreChange(value === "all" ? null : Number(value));
    }

    if (kind === "sort") {
      onSortChange(value as SortType);
    }
  };

  return (
    <HeaderMenu label={i18n.t("navigation.actions.viewFilters")} actions={actions} />
  );
}
