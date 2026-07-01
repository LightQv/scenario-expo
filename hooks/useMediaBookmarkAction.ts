import { useCallback, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { notifyError } from "@/components/toasts/Toast";
import { useBookmarkContext, useUserContext } from "@/contexts";
import i18n from "@/services/i18n";

export type MediaBookmarkActionInput = {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime: number;
  genreIds: number[];
};

type UseMediaBookmarkActionOptions = {
  haptics?: boolean;
};

export default function useMediaBookmarkAction(
  media: MediaBookmarkActionInput,
  options: UseMediaBookmarkActionOptions = {},
) {
  const { user } = useUserContext();
  const { isBookmarked, getBookmarkByTmdbId, addBookmark, removeBookmark } =
    useBookmarkContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const bookmarked = isBookmarked(media.tmdbId, media.mediaType);
  const bookmarkObj = getBookmarkByTmdbId(media.tmdbId, media.mediaType);

  const bookmarkData = useMemo<BookmarkCreate>(
    () => ({
      tmdb_id: media.tmdbId,
      title: media.title,
      poster_path: media.posterPath || "",
      backdrop_path: media.backdropPath || "",
      release_date: media.releaseDate || "",
      runtime: media.runtime,
      media_type: media.mediaType,
      genre_ids: media.genreIds,
    }),
    [
      media.backdropPath,
      media.genreIds,
      media.mediaType,
      media.posterPath,
      media.releaseDate,
      media.runtime,
      media.title,
      media.tmdbId,
    ],
  );

  const toggleBookmark = useCallback(async () => {
    if (options.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!user?.id) {
      notifyError(i18n.t("toast.error"));
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (bookmarked && bookmarkObj) {
        await removeBookmark(bookmarkObj.id);
      } else {
        await addBookmark(bookmarkData);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setIsProcessing(false);
    }
  }, [
    addBookmark,
    bookmarkData,
    bookmarkObj,
    bookmarked,
    isProcessing,
    options.haptics,
    removeBookmark,
    user?.id,
  ]);

  return {
    bookmarked,
    bookmarkObj,
    isProcessing,
    toggleBookmark,
  };
}
