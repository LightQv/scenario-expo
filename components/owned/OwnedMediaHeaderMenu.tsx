import * as Haptics from "expo-haptics";
import i18n from "@/services/i18n";
import HeaderActionCapsule, {
  HeaderMenuItem,
} from "@/components/ui/HeaderActionCapsule";
import { useGenreContext, useOwnedMediaContext } from "@/contexts";

type SortType = "title_asc" | "title_desc" | "date_asc" | "date_desc";
type TvOwnedViewMode = "shows" | "seasons";

type OwnedMediaHeaderMenuProps = {
  mediaType: string;
  sortType: SortType;
  genreId: number | null;
  tvViewMode?: TvOwnedViewMode;
  onSortChange: (sort: SortType) => void;
  onGenreChange: (genreId: number | null) => void;
  onTvViewModeChange?: (viewMode: TvOwnedViewMode) => void;
};

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "title_asc", label: i18n.t("screen.watchlist.detail.sort.titleAsc") },
  { value: "title_desc", label: i18n.t("screen.watchlist.detail.sort.titleDesc") },
  { value: "date_asc", label: i18n.t("screen.watchlist.detail.sort.dateAsc") },
  { value: "date_desc", label: i18n.t("screen.watchlist.detail.sort.dateDesc") },
];

export default function OwnedMediaHeaderMenu({
  mediaType,
  sortType,
  genreId,
  tvViewMode = "shows",
  onSortChange,
  onGenreChange,
  onTvViewModeChange,
}: OwnedMediaHeaderMenuProps) {
  const { movieGenres, tvGenres } = useGenreContext();
  const {
    syncRadarrOwnedMovies,
    syncSonarrOwnedTv,
    refreshSyncStatus,
    syncStatus,
    isSyncing,
  } = useOwnedMediaContext();
  const syncRunning = isSyncing || syncStatus?.status === "running";
  const genres = mediaType === "movie" ? movieGenres : tvGenres;
  const syncSource = mediaType === "tv" ? "SONARR" : "RADARR";
  const syncMediaType = mediaType === "tv" ? "tv" : "movie";
  const genreOptions = [
    { id: null, name: i18n.t("filter.genre.all") },
    ...(genres || []),
  ];

  const handleSyncOwnedMedia = async () => {
    const latestSyncStatus = await refreshSyncStatus(syncSource, syncMediaType);
    if (isSyncing || latestSyncStatus?.status === "running") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (mediaType === "tv") {
        await syncSonarrOwnedTv();
      } else {
        await syncRadarrOwnedMovies();
      }
    } catch {
      // Error toast is handled by OwnedMediaContext.
    }
  };

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

    if (kind === "view") {
      onTvViewModeChange?.(value as TvOwnedViewMode);
    }
  };

  const filterActions: HeaderMenuItem[] = [
    ...(mediaType === "tv"
      ? [
          {
            id: "view",
            title: i18n.t("screen.profile.owned.view.title"),
            icon: "rectangle.grid.1x2",
            children: [
              {
                id: "view:shows",
                title: i18n.t("screen.profile.owned.view.shows"),
                selected: tvViewMode === "shows",
                onPress: () => handlePressAction("view:shows"),
              },
              {
                id: "view:seasons",
                title: i18n.t("screen.profile.owned.view.seasons"),
                selected: tvViewMode === "seasons",
                onPress: () => handlePressAction("view:seasons"),
              },
            ],
          },
        ]
      : []),
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

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: "syncOwnedMedia",
          label: i18n.t(
            syncRunning
              ? mediaType === "tv"
                ? "screen.profile.menu.syncOwnedTvRunning"
                : "screen.profile.menu.syncOwnedMoviesRunning"
              : mediaType === "tv"
                ? "screen.profile.menu.syncOwnedTv"
                : "screen.profile.menu.syncOwnedMovies",
          ),
          icon: "arrow.triangle.2.circlepath",
          disabled: syncRunning,
          onPress: handleSyncOwnedMedia,
        },
        {
          id: "ownedMediaFilters",
          label: i18n.t("navigation.actions.ownedMediaFilters"),
          icon: "ellipsis",
          menu: filterActions,
        },
      ]}
    />
  );
}
