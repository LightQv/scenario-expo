import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import { useUserContext } from "./UserContext";
import { randomUUID } from "expo-crypto";

interface ViewContextValue {
  views: APIMedia[] | null;
  isLoading: boolean;
  refreshViews: () => Promise<void>;
  addView: (viewData: ViewCreate) => Promise<void>;
  removeView: (viewId: string) => Promise<void>;
  isViewed: (tmdbId: number, mediaType: string) => boolean;
  getViewByTmdbId: (tmdbId: number, mediaType: string) => APIMedia | undefined;
}

const ViewContext = createContext<ViewContextValue | undefined>(undefined);

export function useViewContext() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error("useViewContext must be used within a ViewProvider");
  }
  return context;
}

export function ViewProvider({ children }: ContextProps) {
  const { user, authState } = useUserContext();
  const [views, setViews] = useState<APIMedia[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all views for the authenticated user
  const fetchViews = useCallback(async () => {
    if (!user?.id || !authState.authenticated) {
      setViews(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/v1/views/${user.id}`);
      setViews(response);
    } catch (err: any) {
      // Don't show error for 403 (unauthenticated)
      if (!err.message.includes("403")) {
        console.error("Error fetching views:", err);
        notifyError(i18n.t("toast.error"));
      }
      setViews(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, authState.authenticated]);

  // Refresh views (public method)
  const refreshViews = useCallback(async () => {
    await fetchViews();
  }, [fetchViews]);

  // Add a new view
  const addView = useCallback(
    async (viewData: ViewCreate) => {
      if (!user?.id) {
        notifyError(i18n.t("toast.error"));
        return;
      }

      try {
        await apiFetch("/api/v1/views", {
          method: "POST",
          body: JSON.stringify(viewData),
        });

        // Optimistic update: add to local state
        const newView: APIMedia = {
          id: randomUUID(), // Temporary ID until refresh
          ...viewData,
        };
        setViews((prev) => (prev ? [newView, ...prev] : [newView]));

        // Refresh to get server data
        await fetchViews();
      } catch (err: any) {
        console.error("Error adding view:", err);
        notifyError(i18n.t("toast.error"));
        throw err;
      }
    },
    [user?.id, fetchViews],
  );

  // Remove a view
  const removeView = useCallback(
    async (viewId: string) => {
      try {
        await apiFetch(`/api/v1/views/${viewId}`, {
          method: "DELETE",
        });

        // Optimistic update: remove from local state
        setViews((prev) => (prev ? prev.filter((v) => v.id !== viewId) : null));
      } catch (err: any) {
        console.error("Error removing view:", err);
        notifyError(i18n.t("toast.error"));
        // Refresh to restore correct state
        await fetchViews();
        throw err;
      }
    },
    [fetchViews],
  );

  // Check if a media item is viewed
  const isViewed = useCallback(
    (tmdbId: number, mediaType: string) => {
      if (!views) return false;
      return views.some(
        (view) =>
          view.tmdb_id === tmdbId &&
          view.media_type === mediaType &&
          view.viewer_id === user?.id,
      );
    },
    [views, user?.id],
  );

  // Get view object by TMDB ID
  const getViewByTmdbId = useCallback(
    (tmdbId: number, mediaType: string) => {
      if (!views) return undefined;
      return views.find(
        (view) =>
          view.tmdb_id === tmdbId &&
          view.media_type === mediaType &&
          view.viewer_id === user?.id,
      );
    },
    [views, user?.id],
  );

  // Load views when user logs in
  useEffect(() => {
    if (authState.authenticated && user?.id) {
      fetchViews();
    } else {
      setViews(null);
    }
  }, [authState.authenticated, user?.id, fetchViews]);

  const value = useMemo(
    () => ({
      views,
      isLoading,
      refreshViews,
      addView,
      removeView,
      isViewed,
      getViewByTmdbId,
    }),
    [
      views,
      isLoading,
      refreshViews,
      addView,
      removeView,
      isViewed,
      getViewByTmdbId,
    ],
  );

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}
