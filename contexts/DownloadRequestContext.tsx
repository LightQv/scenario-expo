import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/services/instances";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import { useUserContext } from "./UserContext";

interface DownloadRequestContextValue {
  requests: DownloadRequest[];
  isLoading: boolean;
  requestingTmdbIds: number[];
  refreshRequests: () => Promise<void>;
  refreshRequestStatus: (
    tmdbId: number,
    mediaType: string,
  ) => Promise<DownloadRequest | null>;
  requestMovieDownload: (tmdbId: number) => Promise<DownloadRequest | null>;
  retryRequest: (requestId: string) => Promise<DownloadRequest | null>;
  cancelRequest: (requestId: string) => Promise<DownloadRequest | null>;
  getRequest: (tmdbId: number, mediaType: string) => DownloadRequest | null;
  isRequesting: (tmdbId: number) => boolean;
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
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestingTmdbIds, setRequestingTmdbIds] = useState<number[]>([]);

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
      if (!error.message?.includes("403")) {
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
    async (tmdbId: number, mediaType: string) => {
      if (!authState.authenticated) return null;

      try {
        const response = await apiFetch(
          `/api/v1/downloads/status?tmdb_id=${tmdbId}&media_type=${mediaType}`,
        );
        upsertRequest(response || null);
        return response || null;
      } catch (error: any) {
        if (!error.message?.includes("403")) {
          console.error("Error fetching download request status:", error);
        }
        return null;
      }
    },
    [authState.authenticated, upsertRequest],
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
    [authState.authenticated, requestingTmdbIds, upsertRequest],
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

  const isRequesting = useCallback(
    (tmdbId: number) => requestingTmdbIds.includes(tmdbId),
    [requestingTmdbIds],
  );

  useEffect(() => {
    if (authState.authenticated) {
      refreshRequests();
    } else {
      setRequests([]);
    }
  }, [authState.authenticated, refreshRequests]);

  const value = useMemo(
    () => ({
      requests,
      isLoading,
      requestingTmdbIds,
      refreshRequests,
      refreshRequestStatus,
      requestMovieDownload,
      retryRequest,
      cancelRequest,
      getRequest,
      isRequesting,
    }),
    [
      requests,
      isLoading,
      requestingTmdbIds,
      refreshRequests,
      refreshRequestStatus,
      requestMovieDownload,
      retryRequest,
      cancelRequest,
      getRequest,
      isRequesting,
    ],
  );

  return (
    <DownloadRequestContext.Provider value={value}>
      {children}
    </DownloadRequestContext.Provider>
  );
}
