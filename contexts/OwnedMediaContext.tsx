import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError, apiFetch } from "@/services/instances";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import { useUserContext } from "./UserContext";

interface OwnedMediaContextValue {
  ownedMedia: OwnedMedia[];
  syncStatus: OwnedMediaSyncStatus | null;
  isLoading: boolean;
  isSyncing: boolean;
  refreshOwnedMedia: () => Promise<void>;
  refreshSyncStatus: (
    source?: "RADARR" | "SONARR",
    mediaType?: "movie" | "tv",
  ) => Promise<OwnedMediaSyncStatus | null>;
  syncRadarrOwnedMovies: () => Promise<void>;
  syncSonarrOwnedTv: () => Promise<void>;
  isOwned: (tmdbId: number, mediaType: string) => boolean;
  getTvAvailability: (tmdbId: number) => TvAvailability | null;
  refreshTvAvailability: (tmdbId: number) => Promise<TvAvailability | null>;
  refreshTvSeasonAvailability: (
    tmdbId: number,
    seasonNumber: number,
  ) => Promise<TvSeasonAvailability | null>;
  getEpisodeAvailability: (
    tmdbId: number,
    seasonNumber: number,
    episodeNumber: number,
  ) => TvAvailabilityStatus;
}

const OwnedMediaContext = createContext<OwnedMediaContextValue | undefined>(
  undefined,
);

export function useOwnedMediaContext() {
  const context = useContext(OwnedMediaContext);
  if (!context) {
    throw new Error(
      "useOwnedMediaContext must be used within an OwnedMediaProvider",
    );
  }
  return context;
}

export function OwnedMediaProvider({ children }: ContextProps) {
  const { authState } = useUserContext();
  const [ownedMedia, setOwnedMedia] = useState<OwnedMedia[]>([]);
  const [tvAvailabilityByTmdbId, setTvAvailabilityByTmdbId] = useState<
    Record<number, TvAvailability>
  >({});
  const [syncStatus, setSyncStatus] = useState<OwnedMediaSyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasLoadedOwnedMediaRef = useRef(false);
  const ownedMediaRequestRef = useRef<Promise<void> | null>(null);
  const ownedMediaRequestRunRef = useRef(0);

  const fetchOwnedMedia = useCallback((options: { force?: boolean } = {}) => {
    if (!authState.authenticated) {
      ownedMediaRequestRunRef.current += 1;
      hasLoadedOwnedMediaRef.current = false;
      ownedMediaRequestRef.current = null;
      setOwnedMedia([]);
      return Promise.resolve();
    }

    if (ownedMediaRequestRef.current) {
      return ownedMediaRequestRef.current;
    }

    if (hasLoadedOwnedMediaRef.current && !options.force) {
      return Promise.resolve();
    }

    const requestRun = ownedMediaRequestRunRef.current + 1;
    ownedMediaRequestRunRef.current = requestRun;

    const request = (async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch("/api/v1/owned-media");
        if (ownedMediaRequestRunRef.current !== requestRun) return;
        setOwnedMedia(response || []);
      } catch (error: any) {
        if (ownedMediaRequestRunRef.current !== requestRun) return;
        if (!(error instanceof ApiError && error.status === 403)) {
          console.error("Error fetching owned media:", error);
          notifyError(i18n.t("toast.error"));
        }
        setOwnedMedia([]);
      } finally {
        if (ownedMediaRequestRunRef.current !== requestRun) return;
        hasLoadedOwnedMediaRef.current = true;
        ownedMediaRequestRef.current = null;
        setIsLoading(false);
      }
    })();

    ownedMediaRequestRef.current = request;
    return request;
  }, [authState.authenticated]);

  const refreshSyncStatus = useCallback(async (
    source: "RADARR" | "SONARR" = "RADARR",
    mediaType: "movie" | "tv" = "movie",
  ) => {
    if (!authState.authenticated) {
      setSyncStatus(null);
      return null;
    }

    try {
      const response = await apiFetch(
        `/api/v1/owned-media/sync/status?source=${source}&media_type=${mediaType}`,
      );
      setSyncStatus(response || null);
      return response || null;
    } catch (error: any) {
      if (!(error instanceof ApiError && error.status === 403)) {
        console.error("Error fetching owned media sync status:", error);
      }
      setSyncStatus(null);
      return null;
    }
  }, [authState.authenticated]);

  const refreshOwnedMedia = useCallback(async () => {
    await fetchOwnedMedia({ force: true });
  }, [fetchOwnedMedia]);

  const syncRadarrOwnedMovies = useCallback(async () => {
    if (isSyncing) return;

    const latestSyncStatus = await refreshSyncStatus("RADARR", "movie");
    if (latestSyncStatus?.status === "running") return;

    try {
      setIsSyncing(true);
      const response = await apiFetch("/api/v1/owned-media/sync/radarr", {
        method: "POST",
      });
      await refreshSyncStatus("RADARR", "movie");
      if (response?.status !== "running") {
        await fetchOwnedMedia();
      }
      notifySuccess(
        i18n.t(
          response?.status === "running"
            ? "toast.success.ownedMedia.syncStarted"
            : "toast.success.ownedMedia.sync",
          { count: response?.owned_count ?? 0 },
        ),
      );
    } catch (error: any) {
      console.error("Error syncing Radarr owned movies:", error);
      await refreshSyncStatus("RADARR", "movie");
      notifyError(
        error instanceof ApiError && error.status === 409
          ? i18n.t("toast.errorOwnedMediaSyncRunning")
          : i18n.t("toast.error"),
      );
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchOwnedMedia, isSyncing, refreshSyncStatus]);

  const syncSonarrOwnedTv = useCallback(async () => {
    if (isSyncing) return;

    const latestSyncStatus = await refreshSyncStatus("SONARR", "tv");
    if (latestSyncStatus?.status === "running") return;

    try {
      setIsSyncing(true);
      const response = await apiFetch("/api/v1/owned-media/sync/sonarr", {
        method: "POST",
      });
      await refreshSyncStatus("SONARR", "tv");
      if (response?.status !== "running") {
        await fetchOwnedMedia();
      }
      notifySuccess(
        i18n.t(
          response?.status === "running"
            ? "toast.success.ownedMedia.syncStarted"
            : "toast.success.ownedMedia.sync",
          { count: response?.owned_count ?? 0 },
        ),
      );
    } catch (error: any) {
      console.error("Error syncing Sonarr owned TV:", error);
      await refreshSyncStatus("SONARR", "tv");
      notifyError(
        error instanceof ApiError && error.status === 409
          ? i18n.t("toast.errorOwnedMediaSyncRunning")
          : i18n.t("toast.error"),
      );
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [fetchOwnedMedia, isSyncing, refreshSyncStatus]);

  const isOwned = useCallback(
    (tmdbId: number, mediaType: string) => {
      return ownedMedia.some(
        (item) => item.tmdb_id === tmdbId && item.media_type === mediaType,
      );
    },
    [ownedMedia],
  );

  const getTvAvailability = useCallback(
    (tmdbId: number) => tvAvailabilityByTmdbId[tmdbId] || null,
    [tvAvailabilityByTmdbId],
  );

  const refreshTvAvailability = useCallback(
    async (tmdbId: number) => {
      if (!authState.authenticated) return null;
      try {
        const response = await apiFetch(
          `/api/v1/owned-media/tv/status?tmdb_id=${tmdbId}`,
        );
        if (response) {
          setTvAvailabilityByTmdbId((current) => ({
            ...current,
            [tmdbId]: response,
          }));
        }
        return response || null;
      } catch (error: any) {
        if (!(error instanceof ApiError && error.status === 403)) {
          console.error("Error fetching TV availability:", error);
        }
        return null;
      }
    },
    [authState.authenticated],
  );

  const refreshTvSeasonAvailability = useCallback(
    async (tmdbId: number, seasonNumber: number) => {
      if (!authState.authenticated) return null;
      try {
        const response = await apiFetch(
          `/api/v1/owned-media/tv/season/status?tmdb_id=${tmdbId}&season_number=${seasonNumber}`,
        );
        if (response) {
          setTvAvailabilityByTmdbId((current) => {
            const existing = current[tmdbId];
            if (!existing) return current;
            return {
              ...current,
              [tmdbId]: {
                ...existing,
                seasons: existing.seasons.map((season) =>
                  season.season_number === seasonNumber ? response : season,
                ),
              },
            };
          });
        }
        return response || null;
      } catch (error: any) {
        if (!(error instanceof ApiError && error.status === 403)) {
          console.error("Error fetching TV season availability:", error);
        }
        return null;
      }
    },
    [authState.authenticated],
  );

  const getEpisodeAvailability = useCallback(
    (tmdbId: number, seasonNumber: number, episodeNumber: number) => {
      const season = tvAvailabilityByTmdbId[tmdbId]?.seasons.find(
        (item) => item.season_number === seasonNumber,
      );
      return (
        season?.episodes.find((episode) => episode.episode_number === episodeNumber)
          ?.status || "unknown"
      );
    },
    [tvAvailabilityByTmdbId],
  );

  useEffect(() => {
    if (authState.authenticated) {
      fetchOwnedMedia();
    } else {
      ownedMediaRequestRunRef.current += 1;
      hasLoadedOwnedMediaRef.current = false;
      ownedMediaRequestRef.current = null;
      setOwnedMedia([]);
      setTvAvailabilityByTmdbId({});
      setSyncStatus(null);
    }
  }, [authState.authenticated, fetchOwnedMedia]);

  const value = useMemo(
    () => ({
      ownedMedia,
      syncStatus,
      isLoading,
      isSyncing,
      refreshOwnedMedia,
      refreshSyncStatus,
      syncRadarrOwnedMovies,
      syncSonarrOwnedTv,
      isOwned,
      getTvAvailability,
      refreshTvAvailability,
      refreshTvSeasonAvailability,
      getEpisodeAvailability,
    }),
    [
      ownedMedia,
      syncStatus,
      isLoading,
      isSyncing,
      refreshOwnedMedia,
      refreshSyncStatus,
      syncRadarrOwnedMovies,
      syncSonarrOwnedTv,
      isOwned,
      getTvAvailability,
      refreshTvAvailability,
      refreshTvSeasonAvailability,
      getEpisodeAvailability,
    ],
  );

  return (
    <OwnedMediaContext.Provider value={value}>
      {children}
    </OwnedMediaContext.Provider>
  );
}
