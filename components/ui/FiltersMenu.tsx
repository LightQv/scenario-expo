import { StyleSheet } from "react-native";
import { ContextMenu, Host, Image, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";

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
  // Build media type options
  const mediaTypeOptions = [
    i18n.t("filter.type.movie"),
    i18n.t("filter.type.tv"),
  ];
  const selectedMediaTypeIndex = mediaType === "movie" ? 0 : 1;

  // Build genre options array with "All" at the beginning
  const genreOptions = [
    i18n.t("filter.genre.all"),
    ...genres.map((g) => g.name),
  ];

  // Calculate selected genre index (0 for "All", index+1 for genres)
  const selectedGenreIndex =
    selectedGenreId === null
      ? 0
      : genres.findIndex((g) => g.id === selectedGenreId) + 1;

  // Build sort options array
  const sortLabels = sortOptions.map((s) => s.label);

  // Calculate selected sort index
  const selectedSortIndex = sortOptions.findIndex(
    (s) => s.value === selectedSort,
  );

  const handleMediaTypeSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onMediaTypeChange) {
      onMediaTypeChange(index === 0 ? "movie" : "tv");
    }
  };

  const handleGenreSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (index === 0) {
      onGenreChange(null); // "All" selected
    } else {
      onGenreChange(genres[index - 1].id);
    }
  };

  const handleSortSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(sortOptions[index].value);
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          {/* Media Type Picker - only show if mediaType and onMediaTypeChange are provided */}
          {mediaType && onMediaTypeChange && (
            <Picker
              label={i18n.t("filter.type.title")}
              options={mediaTypeOptions}
              variant="menu"
              selectedIndex={selectedMediaTypeIndex}
              onOptionSelected={({ nativeEvent: { index } }) =>
                handleMediaTypeSelect(index)
              }
            />
          )}
          <Picker
            label={i18n.t("filter.genre.title")}
            options={genreOptions}
            variant="menu"
            selectedIndex={selectedGenreIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleGenreSelect(index)
            }
          />
          <Picker
            label={i18n.t("filter.sort.title")}
            options={sortLabels}
            variant="menu"
            selectedIndex={selectedSortIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleSortSelect(index)
            }
          />
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Image systemName="ellipsis" />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 26,
    width: 20,
    marginLeft: 8,
  },
});
