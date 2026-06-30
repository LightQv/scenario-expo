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
import { useOwnedMediaContext } from "./OwnedMediaContext";

interface DownloadRequestContextValue {
  requests: DownloadRequest[];
  isLoading: boolean;
  requestingTmdbIds: number[];
  requestingKeys: string[];
  refreshRequests: () => Promise<void>;
  refreshRequestStatus: (
    tmdbId: number,
    mediaType: string,
    scope?: "movie" | "series" | "season" | "episode",
    seasonNumber?: number,
    episodeNumber?: number,
  ) => Promise<DownloadRequest | null>;
  requestMovieDownload: (tmdbId: number) => Promise<DownloadRequest | null>;
  requestSeriesDownload: (tmdbId: number) => Promise<DownloadRequest | null>;
  requestSeasonDownload: (
    tmdbId: number,
    seasonNumber: number,
  ) => Promise<DownloadRequest | null>;
  retryRequest: (requestId: string) => Promise<DownloadRequest | null>;
  cancelRequest: (requestId: string) => Promise<DownloadRequest | null>;
  cleanRequests: () => Promise<number>;
  cancelAllRequests: () => Promise<number>;
  getRequest: (tmdbId: number, mediaType: string) => DownloadRequest | null;
  getRequestForScope: (
    tmdbId: number,
    mediaType: string,
    scope: "movie" | "series" | "season" | "episode",
    seasonNumber?: number,
    episodeNumber?: number,
  ) => DownloadRequest | null;
  isRequesting: (tmdbId: number) => boolean;
  isRequestingKey: (key: string) => boolean;
}

const DownloadRequestContext = createContext<
  DownloadRequestContextValue | undefined
>(undefined);

export function useDownloadRequestContext() {
  const context = useContext(DownloadRequestContext);
  if (!context) {
    throw new Error(
      "useDownloadRequestContext must be used within a DownloadRequestProvider",
    );
  }
  return context;
}

export function DownloadRequestProvider({ children }: ContextProps) {
  const { authState } = useUserContext();
  const { refreshOwnedMedia } = useOwnedMediaContext();
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingTmdbIds, setRequestingTmdbIds] = useState<number[]>([]);
  const [requestingKeys, setRequestingKeys] = useState<string[]>([]);
  const availableRequestIdsRef = useRef<Set<string>>(new Set());

  const refreshRequests = useCallback(async () => {
    if (!authState.authenticated) {
      setRequests([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch("/api/v1/downloads");
      setRequests(response || []);
    } catch (error: any) {
      if (!(error instanceof ApiError && error.status === 403)) {
        console.error("Error fetching download requests:", error);
        notifyError(i18n.t("toast.error"));
      }
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [authState.authenticated]);

  const upsertRequest = useCallback((request: DownloadRequest | null) => {
    if (!request) return;
    setRequests((current) => {
      const existingIndex = current.findIndex((item) => item.id === request.id);
      if (existingIndex === -1) {
        return [request, ...current];
      }
      const next = [...current];
      next[existingIndex] = request;
      return next;
    });
  }, []);

  const refreshRequestStatus = useCallback(
    async (
      tmdbId: number,
      mediaType: string,
      scope?: "movie" | "series" | "season" | "episode",
      seasonNumber?: number,
      episodeNumber?: number,
    ) => {
      if (!authState.authenticated) return null;

      try {
        const response = await apiFetch(
          `/api/v1/downloads/status?tmdb_id=${tmdbId}&media_type=${mediaType}${scope ? `&scope=${scope}` : ""}${seasonNumber ? `&season_number=${seasonNumber}` : ""}${episodeNumber ? `&episode_number=${episodeNumber}` : ""}`,
        );
        upsertRequest(response || null);
        return response || null;
      } catch (error: any) {
        if (!(error instanceof ApiError && error.status === 403)) {
          console.error("Error fetching download request status:", error);
        }
        return null;
      }
    },
    [authState.authenticated, upsertRequest],
  );

  const scheduleRequestRefresh = useCallback(
    (
      tmdbId: number,
      mediaType: string,
      scope?: "movie" | "series" | "season" | "episode",
      seasonNumber?: number,
    ) => {
      setTimeout(() => {
        refreshRequestStatus(tmdbId, mediaType, scope, seasonNumber);
      }, 1200);
    },
    [refreshRequestStatus],
  );

  const requestScopedDownload = useCallback(
    async (
      tmdbId: number,
      scope: "series" | "season",
      seasonNumber?: number,
    ) => {
      if (!authState.authenticated) return null;
      const requestKey = makeRequestKey(scope, tmdbId, seasonNumber);
      if (requestingKeys.includes(requestKey)) return null;

      try {
        setRequestingKeys((current) => [...current, requestKey]);
        const response = await apiFetch(
          scope === "series"
            ? "/api/v1/downloads/sonarr/series"
            : "/api/v1/downloads/sonarr/seasons",
          {
            method: "POST",
            body: JSON.stringify({ tmdb_id: tmdbId, season_number: seasonNumber }),
          },
        );
        upsertRequest(response || null);
        notifySuccess(i18n.t("toast.success.download.requested"));
        scheduleRequestRefresh(tmdbId, "tv", scope, seasonNumber);
        return response || null;
      } catch (error) {
        console.error("Error requesting TV download:", error);
        notifyError(i18n.t("toast.error"));
        throw error;
      } finally {
        setRequestingKeys((current) => current.filter((item) => item !== requestKey));
      }
    },
    [authState.authenticated, requestingKeys, scheduleRequestRefresh, upsertRequest],
  );

  const requestSeriesDownload = useCallback(
    (tmdbId: number) => requestScopedDownload(tmdbId, "series"),
    [requestScopedDownload],
  );

  const requestSeasonDownload = useCallback(
    (tmdbId: number, seasonNumber: number) =>
      requestScopedDownload(tmdbId, "season", seasonNumber),
    [requestScopedDownload],
  );

  const requestMovieDownload = useCallback(
    async (tmdbId: number) => {
      if (!authState.authenticated) return null;
      if (requestingTmdbIds.includes(tmdbId)) return null;

      try {
        setRequestingTmdbIds((current) => [...current, tmdbId]);
        const response = await apiFetch("/api/v1/downloads/radarr/movies", {
          method: "POST",
          body: JSON.stringify({ tmdb_id: tmdbId }),
        });
        upsertRequest(response || null);
        notifySuccess(i18n.t("toast.success.download.requested"));
        scheduleRequestRefresh(tmdbId, "movie", "movie");
        return response || null;
      } catch (error) {
        console.error("Error requesting movie download:", error);
        notifyError(i18n.t("toast.error"));
        throw error;
      } finally {
        setRequestingTmdbIds((current) =>
          current.filter((item) => item !== tmdbId),
        );
      }
    },
    [authState.authenticated, requestingTmdbIds, scheduleRequestRefresh, upsertRequest],
  );

  const retryRequest = useCallback(
    async (requestId: string) => {
      if (!authState.authenticated) return null;

      try {
        const response = await apiFetch(`/api/v1/downloads/${requestId}/retry`, {
          method: "POST",
        });
        upsertRequest(response || null);
        return response || null;
      } catch (error) {
        console.error("Error retrying download request:", error);
        notifyError(i18n.t("toast.error"));
        return null;
      }
    },
    [authState.authenticated, upsertRequest],
  );

  const cancelRequest = useCallback(
    async (requestId: string) => {
      if (!authState.authenticated) return null;

      try {
        const response = await apiFetch(`/api/v1/downloads/${requestId}/cancel`, {
          method: "POST",
        });
        upsertRequest(response || null);
        return response || null;
      } catch (error) {
        console.error("Error cancelling download request:", error);
        notifyError(i18n.t("toast.error"));
        return null;
      }
    },
    [authState.authenticated, upsertRequest],
  );

  const cleanRequests = useCallback(async () => {
    if (!authState.authenticated) return 0;

    try {
      const response = await apiFetch("/api/v1/downloads/clean", {
        method: "DELETE",
      });
      await refreshRequests();
      const deletedCount = response?.deleted_count ?? 0;
      notifySuccess(i18n.t("toast.success.download.cleaned", { count: deletedCount }));
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning download requests:", error);
      notifyError(i18n.t("toast.error"));
      return 0;
    }
  }, [authState.authenticated, refreshRequests]);

  const cancelAllRequests = useCallback(async () => {
    if (!authState.authenticated) return 0;

    try {
      const response = await apiFetch("/api/v1/downloads/cancel-all", {
        method: "POST",
      });
      await refreshRequests();
      const cancelledCount = response?.cancelled_count ?? 0;
      notifySuccess(i18n.t("toast.success.download.cancelledAll", { count: cancelledCount }));
      return cancelledCount;
    } catch (error) {
      console.error("Error cancelling all download requests:", error);
      notifyError(i18n.t("toast.error"));
      return 0;
    }
  }, [authState.authenticated, refreshRequests]);

  const getRequest = useCallback(
    (tmdbId: number, mediaType: string) => {
      return (
        requests.find(
          (item) => item.tmdb_id === tmdbId && item.media_type === mediaType,
        ) || null
      );
    },
    [requests],
  );

  const getRequestForScope = useCallback(
    (
      tmdbId: number,
      mediaType: string,
      scope: "movie" | "series" | "season" | "episode",
      seasonNumber?: number,
      episodeNumber?: number,
    ) => {
      return (
        requests.find((item) => {
          if (item.tmdb_id !== tmdbId || item.media_type !== mediaType || item.scope !== scope) {
            return false;
          }
          if (seasonNumber !== undefined && item.season_number !== seasonNumber) {
            return false;
          }
          if (episodeNumber !== undefined && item.episode_number !== episodeNumber) {
            return false;
          }
          return true;
        }) || null
      );
    },
    [requests],
  );

  const isRequesting = useCallback(
    (tmdbId: number) => requestingTmdbIds.includes(tmdbId),
    [requestingTmdbIds],
  );

  const isRequestingKey = useCallback(
    (key: string) => requestingKeys.includes(key),
    [requestingKeys],
  );

  useEffect(() => {
    if (authState.authenticated) {
      refreshRequests();
    } else {
      setRequests([]);
      availableRequestIdsRef.current.clear();
    }
  }, [authState.authenticated, refreshRequests]);

  useEffect(() => {
    if (!authState.authenticated) return;

    const availableRequestIds = requests
      .filter((request) => request.status === "available")
      .map((request) => request.id);

    const hasNewAvailableRequest = availableRequestIds.some(
      (requestId) => !availableRequestIdsRef.current.has(requestId),
    );

    if (!hasNewAvailableRequest) return;

    availableRequestIds.forEach((requestId) => {
      availableRequestIdsRef.current.add(requestId);
    });

    refreshOwnedMedia();
  }, [authState.authenticated, refreshOwnedMedia, requests]);

  const value = useMemo(
    () => ({
      requests,
      isLoading,
      requestingTmdbIds,
      requestingKeys,
      refreshRequests,
      refreshRequestStatus,
      requestMovieDownload,
      requestSeriesDownload,
      requestSeasonDownload,
      retryRequest,
      cancelRequest,
      cleanRequests,
      cancelAllRequests,
      getRequest,
      getRequestForScope,
      isRequesting,
      isRequestingKey,
    }),
    [
      requests,
      isLoading,
      requestingTmdbIds,
      requestingKeys,
      refreshRequests,
      refreshRequestStatus,
      requestMovieDownload,
      requestSeriesDownload,
      requestSeasonDownload,
      retryRequest,
      cancelRequest,
      cleanRequests,
      cancelAllRequests,
      getRequest,
      getRequestForScope,
      isRequesting,
      isRequestingKey,
    ],
  );

  return (
    <DownloadRequestContext.Provider value={value}>
      {children}
    </DownloadRequestContext.Provider>
  );
}

function makeRequestKey(
  scope: "movie" | "series" | "season" | "episode",
  tmdbId: number,
  seasonNumber?: number,
  episodeNumber?: number,
) {
  return [scope, tmdbId, seasonNumber, episodeNumber]
    .filter((item) => item !== undefined)
    .join(":");
}
