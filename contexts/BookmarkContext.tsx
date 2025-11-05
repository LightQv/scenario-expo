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

interface BookmarkContextValue {
  bookmarks: APIMedia[] | null;
  isLoading: boolean;
  refreshBookmarks: () => Promise<void>;
  addBookmark: (bookmarkData: BookmarkCreate) => Promise<void>;
  removeBookmark: (mediaId: string) => Promise<void>;
  isBookmarked: (tmdbId: number, mediaType: string) => boolean;
  getBookmarkByTmdbId: (
    tmdbId: number,
    mediaType: string,
  ) => APIMedia | undefined;
  bookmarkCount: number;
}

const BookmarkContext = createContext<BookmarkContextValue | undefined>(
  undefined,
);

export function useBookmarkContext() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error(
      "useBookmarkContext must be used within a BookmarkProvider",
    );
  }
  return context;
}

export function BookmarkProvider({ children }: ContextProps) {
  const { user, authState } = useUserContext();
  const [bookmarks, setBookmarks] = useState<APIMedia[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all bookmarks for the authenticated user
  const fetchBookmarks = useCallback(async () => {
    if (!user?.id || !authState.authenticated) {
      setBookmarks(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch(`/api/v1/bookmarks/${user.id}`);
      setBookmarks(response);
    } catch (err: any) {
      // Don't show error for 403 (unauthenticated)
      if (!err.message.includes("403")) {
        console.error("Error fetching bookmarks:", err);
        notifyError(i18n.t("toast.error"));
      }
      setBookmarks(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, authState.authenticated]);

  // Refresh bookmarks (public method)
  const refreshBookmarks = useCallback(async () => {
    await fetchBookmarks();
  }, [fetchBookmarks]);

  // Add a new bookmark
  const addBookmark = useCallback(
    async (bookmarkData: BookmarkCreate) => {
      if (!user?.id) {
        notifyError(i18n.t("toast.error"));
        return;
      }

      try {
        await apiFetch("/api/v1/bookmarks", {
          method: "POST",
          body: JSON.stringify(bookmarkData),
        });

        // Optimistic update: add to local state
        const newBookmark: APIMedia = {
          id: randomUUID(), // Temporary ID until refresh
          ...bookmarkData,
          release_year: bookmarkData.release_date.split("-")[0],
          type: "PENDING",
        };
        setBookmarks((prev) => (prev ? [newBookmark, ...prev] : [newBookmark]));

        // Refresh to get server data
        await fetchBookmarks();
      } catch (err: any) {
        console.error("Error adding bookmark:", err);
        notifyError(i18n.t("toast.error"));
        throw err;
      }
    },
    [user?.id, fetchBookmarks],
  );

  // Remove a bookmark
  const removeBookmark = useCallback(
    async (mediaId: string) => {
      try {
        await apiFetch(`/api/v1/bookmarks/${mediaId}`, {
          method: "DELETE",
        });

        // Optimistic update: remove from local state
        setBookmarks((prev) =>
          prev ? prev.filter((b) => b.id !== mediaId) : null,
        );
      } catch (err: any) {
        console.error("Error removing bookmark:", err);
        notifyError(i18n.t("toast.error"));
        // Refresh to restore correct state
        await fetchBookmarks();
        throw err;
      }
    },
    [fetchBookmarks],
  );

  // Check if a media item is bookmarked
  const isBookmarked = useCallback(
    (tmdbId: number, mediaType: string) => {
      if (!bookmarks) return false;
      return bookmarks.some(
        (bookmark) =>
          bookmark.tmdb_id === tmdbId && bookmark.media_type === mediaType,
      );
    },
    [bookmarks],
  );

  // Get bookmark object by TMDB ID
  const getBookmarkByTmdbId = useCallback(
    (tmdbId: number, mediaType: string) => {
      if (!bookmarks) return undefined;
      return bookmarks.find(
        (bookmark) =>
          bookmark.tmdb_id === tmdbId && bookmark.media_type === mediaType,
      );
    },
    [bookmarks],
  );

  // Get bookmark count
  const bookmarkCount = useMemo(() => {
    return bookmarks?.length || 0;
  }, [bookmarks]);

  // Load bookmarks when user logs in
  useEffect(() => {
    if (authState.authenticated && user?.id) {
      fetchBookmarks();
    } else {
      setBookmarks(null);
    }
  }, [authState.authenticated, user?.id, fetchBookmarks]);

  const value = useMemo(
    () => ({
      bookmarks,
      isLoading,
      refreshBookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      getBookmarkByTmdbId,
      bookmarkCount,
    }),
    [
      bookmarks,
      isLoading,
      refreshBookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      getBookmarkByTmdbId,
      bookmarkCount,
    ],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}
