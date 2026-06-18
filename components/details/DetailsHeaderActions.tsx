import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useBookmarkContext, useUserContext, useViewContext } from "@/contexts";
import useView from "@/hooks/useView";
import { CONFIG } from "@/services/config";
import i18n from "@/services/i18n";

type DetailsHeaderActionsProps = {
  data: TmdbDetails;
  mediaType: string;
  tmdbId: string;
};

function getMediaRuntime(data: TmdbDetails, type: string): number {
  if (type === "tv") {
    return data.number_of_episodes || 0;
  }

  return data.runtime || 0;
}

export default function DetailsHeaderActions({
  data,
  mediaType,
  tmdbId,
}: DetailsHeaderActionsProps) {
  const numericTmdbId = Number(tmdbId);
  const title = data.title || data.name || "";
  const releaseDate = data.release_date || data.first_air_date || "";
  const genreIds = data.genres?.map((genre) => genre.id) || [];

  const { user, authState } = useUserContext();
  const { addView, removeView } = useViewContext();
  const { viewed, viewObj } = useView(numericTmdbId, mediaType);
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkByTmdbId } =
    useBookmarkContext();

  const bookmarked = isBookmarked(numericTmdbId, mediaType);

  const handleBookmark = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (bookmarked) {
        const bookmark = getBookmarkByTmdbId(numericTmdbId, mediaType);
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        await addBookmark({
          tmdb_id: numericTmdbId,
          title,
          poster_path: data.poster_path || "",
          backdrop_path: data.backdrop_path || "",
          release_date: releaseDate,
          runtime: getMediaRuntime(data, mediaType),
          media_type: mediaType,
          genre_ids: genreIds,
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleView = async () => {
    if (!authState.authenticated || !user) {
      router.push("/(modal)/login");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (viewed && viewObj) {
        await removeView(viewObj.id);
      } else {
        await addView({
          tmdb_id: numericTmdbId,
          genre_ids: [0, ...genreIds],
          poster_path: data.poster_path || "",
          backdrop_path: data.backdrop_path || data.poster_path || "",
          release_date: releaseDate,
          release_year: releaseDate.slice(0, 4),
          runtime: getMediaRuntime(data, mediaType),
          title,
          media_type: mediaType,
          viewer_id: user.id,
        });
      }
    } catch (error) {
      console.error("Error handling view:", error);
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleCopy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await Clipboard.setStringAsync(
        `${CONFIG.webClientUrl}/details/${mediaType}/${tmdbId}`,
      );
      notifySuccess(i18n.t("toast.success.urlCopied"));
    } catch (error) {
      notifyError(i18n.t("toast.error"));
    }
  };

  const handleAddToWatchlist = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(modal)/watchlist-add",
      params: { tmdbId, mediaType, title },
    });
  };

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: "bookmark",
          label: i18n.t("screen.detail.actions.bookmark"),
          icon: bookmarked ? "bookmark.fill" : "bookmark",
          active: bookmarked,
          onPress: handleBookmark,
        },
        {
          id: "view",
          label: i18n.t("screen.watchlist.detail.menu.view"),
          icon: "eye",
          active: viewed,
          onPress: handleView,
        },
        {
          id: "more",
          label: "More actions",
          icon: "ellipsis",
          menu: [
            {
              id: "copy",
              title: i18n.t("screen.detail.actions.copy"),
              icon: "doc.on.doc",
              onPress: handleCopy,
            },
            {
              id: "addToWatchlist",
              title: i18n.t("screen.detail.actions.addToWatchlist"),
              icon: "plus.square.on.square",
              onPress: handleAddToWatchlist,
            },
          ],
        },
      ]}
    />
  );
}
