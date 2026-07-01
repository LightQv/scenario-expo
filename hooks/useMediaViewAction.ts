import { useCallback, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { notifyError } from "@/components/toasts/Toast";
import { useUserContext, useViewContext } from "@/contexts";
import i18n from "@/services/i18n";

export type MediaViewActionInput = {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  releaseYear?: string | null;
  runtime: number;
  genreIds: number[];
};

type UseMediaViewActionOptions = {
  haptics?: boolean;
  unauthenticatedBehavior?: "redirect" | "error";
};

export default function useMediaViewAction(
  media: MediaViewActionInput,
  options: UseMediaViewActionOptions = {},
) {
  const router = useRouter();
  const { user, authState } = useUserContext();
  const { isViewed, getViewByTmdbId, addView, removeView } = useViewContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const viewed = isViewed(media.tmdbId, media.mediaType);
  const viewObj = getViewByTmdbId(media.tmdbId, media.mediaType);

  const viewData = useMemo<ViewCreate>(
    () => ({
      tmdb_id: media.tmdbId,
      genre_ids: media.genreIds,
      poster_path: media.posterPath || "",
      backdrop_path: media.backdropPath || "",
      release_date: media.releaseDate || "",
      release_year:
        media.releaseYear || (media.releaseDate ? media.releaseDate.slice(0, 4) : ""),
      runtime: media.runtime,
      title: media.title,
      media_type: media.mediaType,
      viewer_id: user?.id || "",
    }),
    [
      media.backdropPath,
      media.genreIds,
      media.mediaType,
      media.posterPath,
      media.releaseDate,
      media.releaseYear,
      media.runtime,
      media.title,
      media.tmdbId,
      user?.id,
    ],
  );

  const toggleView = useCallback(async () => {
    if (options.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (!authState.authenticated || !user?.id) {
      if (options.unauthenticatedBehavior === "error") {
        notifyError(i18n.t("toast.error"));
      } else {
        router.push("/(modal)/login");
      }
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (viewed && viewObj) {
        await removeView(viewObj.id);
      } else {
        await addView({ ...viewData, viewer_id: user.id });
      }
    } catch (error) {
      console.error("Error handling view:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setIsProcessing(false);
    }
  }, [
    addView,
    authState.authenticated,
    isProcessing,
    options.haptics,
    options.unauthenticatedBehavior,
    removeView,
    router,
    user?.id,
    viewData,
    viewObj,
    viewed,
  ]);

  return {
    viewed,
    viewObj,
    isProcessing,
    toggleView,
  };
}
