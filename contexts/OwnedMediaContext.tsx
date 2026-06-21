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

interface OwnedMediaContextValue {
  ownedMedia: OwnedMedia[];
  syncStatus: OwnedMediaSyncStatus | null;
  isLoading: boolean;
  isSyncing: boolean;
  refreshOwnedMedia: () => Promise<void>;
  refreshSyncStatus: () => Promise<OwnedMediaSyncStatus | null>;
  syncRadarrOwnedMovies: () => Promise<void>;
  isOwned: (tmdbId: number, mediaType: string) => boolean;
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
  const [syncStatus, setSyncStatus] = useState<OwnedMediaSyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchOwnedMedia = useCallback(async () => {
    if (!authState.authenticated) {
      setOwnedMedia([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch("/api/v1/owned-media");
      setOwnedMedia(response || []);
    } catch (error: any) {
      if (!error.message?.includes("403")) {
        console.error("Error fetching owned media:", error);
        notifyError(i18n.t("toast.error"));
      }
      setOwnedMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [authState.authenticated]);

  const refreshSyncStatus = useCallback(async () => {
    if (!authState.authenticated) {
      setSyncStatus(null);
      return null;
    }

    try {
      const response = await apiFetch("/api/v1/owned-media/sync/status");
      setSyncStatus(response || null);
      return response || null;
    } catch (error: any) {
      if (!error.message?.includes("403")) {
        console.error("Error fetching owned media sync status:", error);
      }
      setSyncStatus(null);
      return null;
    }
  }, [authState.authenticated]);

  const refreshOwnedMedia = useCallback(async () => {
    await fetchOwnedMedia();
  }, [fetchOwnedMedia]);

  const syncRadarrOwnedMovies = useCallback(async () => {
    if (isSyncing) return;

    const latestSyncStatus = await refreshSyncStatus();
    if (latestSyncStatus?.status === "running") return;

    try {
      setIsSyncing(true);
      const response = await apiFetch("/api/v1/owned-media/sync/radarr", {
        method: "POST",
      });
      await refreshSyncStatus();
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
      await refreshSyncStatus();
      notifyError(
        error.message?.includes("409")
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

  useEffect(() => {
    if (authState.authenticated) {
      fetchOwnedMedia();
    } else {
      setOwnedMedia([]);
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
      isOwned,
    }),
    [
      ownedMedia,
      syncStatus,
      isLoading,
      isSyncing,
      refreshOwnedMedia,
      refreshSyncStatus,
      syncRadarrOwnedMovies,
      isOwned,
    ],
  );

  return (
    <OwnedMediaContext.Provider value={value}>
      {children}
    </OwnedMediaContext.Provider>
  );
}
