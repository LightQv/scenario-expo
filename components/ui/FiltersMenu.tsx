import * as Haptics from "expo-haptics";
import i18n from "@/services/i18n";
import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderMenu from "@/components/ui/HeaderMenu";

export type SortOption = {
  value: string;
  label: string;
};

type Genre = {
  id: number;
  name: string;
};

type MediaType = "movie" | "tv";

type FiltersMenuProps = {
  genres: Genre[];
  selectedGenreId: number | null;
  onGenreChange: (genreId: number | null) => void;
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (sort: string) => void;
  // Optional media type props
  mediaType?: MediaType;
  onMediaTypeChange?: (type: MediaType) => void;
};

export default function FiltersMenu({
  genres,
  selectedGenreId,
  onGenreChange,
  sortOptions,
  selectedSort,
  onSortChange,
  mediaType,
  onMediaTypeChange,
}: FiltersMenuProps) {
  const mediaTypeOptions = [
    { value: "movie", label: i18n.t("filter.type.movie") },
    { value: "tv", label: i18n.t("filter.type.tv") },
  ] as const;

  const genreOptions = [
    { id: null, name: i18n.t("filter.genre.all") },
    ...genres,
  ];

  const actions: HeaderMenuItem[] = [
    ...(mediaType && onMediaTypeChange
      ? [
          {
            id: "type",
            title: i18n.t("filter.type.title"),
            icon: "play.rectangle",
            children: mediaTypeOptions.map((option) => ({
              id: `type:${option.value}`,
              title: option.label,
              selected: mediaType === option.value,
              onPress: () => handlePressAction(`type:${option.value}`),
            })),
          } satisfies HeaderMenuItem,
        ]
      : []),
    {
      id: "genre",
      title: i18n.t("filter.genre.title"),
      icon: "tag",
      children: genreOptions.map((option) => ({
        id: `genre:${option.id ?? "all"}`,
        title: option.name,
        selected: selectedGenreId === option.id,
        onPress: () => handlePressAction(`genre:${option.id ?? "all"}`),
      })),
    },
    {
      id: "sort",
      title: i18n.t("filter.sort.title"),
      icon: "arrow.up.arrow.down",
      children: sortOptions.map((option) => ({
        id: `sort:${option.value}`,
        title: option.label,
        selected: selectedSort === option.value,
        onPress: () => handlePressAction(`sort:${option.value}`),
      })),
    },
  ];

  const handlePressAction = (id: string) => {
    const [kind, value] = id.split(":");
    if (!value) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (kind === "type" && onMediaTypeChange) {
      onMediaTypeChange(value as MediaType);
    }

    if (kind === "genre") {
      onGenreChange(value === "all" ? null : Number(value));
    }

    if (kind === "sort") {
      onSortChange(value);
    }
  };

  return (
    <HeaderMenu label="Filters" actions={actions} />
  );
}
