import { StyleSheet, View } from "react-native";
import { ContextMenu, Host, Image, Picker } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useGenreContext } from "@/contexts/GenreContext";

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
  const { colors } = useThemeContext();
  const { movieGenres, tvGenres } = useGenreContext();

  // Get genres based on media type
  const genres = mediaType === "movie" ? movieGenres : tvGenres;

  // Build genre options with "All" at the beginning
  const genreOptions = [
    { id: null, name: i18n.t("filter.genre.all") },
    ...(genres || []),
  ];

  const genreLabels = genreOptions.map((g) => g.name);

  // Calculate selected indices
  const selectedSortIndex = SORT_OPTIONS.findIndex((s) => s.value === sortType);
  const selectedGenreIndex = genreOptions.findIndex((g) => g.id === genreId);

  // Build sort labels
  const sortLabels = SORT_OPTIONS.map((s) => s.label);

  const handleSortSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSortChange(SORT_OPTIONS[index].value);
  };

  const handleGenreSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGenreChange(genreOptions[index].id);
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Picker
            label={i18n.t("filter.genre.title")}
            options={genreLabels}
            variant="menu"
            selectedIndex={selectedGenreIndex}
            onOptionSelected={({ nativeEvent: { index } }) =>
              handleGenreSelect(index)
            }
          />
          <Picker
            label={i18n.t("screen.watchlist.detail.menu.sort")}
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
              <Image systemName="ellipsis" color={colors.text} />
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
