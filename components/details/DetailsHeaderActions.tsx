import { router } from "expo-router";
import { useEffect } from "react";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import {
  useDownloadRequestContext,
  useOwnedMediaContext,
  useUserContext,
} from "@/contexts";
import { CONFIG } from "@/services/config";
import i18n from "@/services/i18n";

type DetailsHeaderActionsProps = {
  data: TmdbDetails;
  mediaType: string;
  tmdbId: string;
};

export default function DetailsHeaderActions({
  data,
  mediaType,
  tmdbId,
}: DetailsHeaderActionsProps) {
  const title = data.title || data.name || "";
  const numericTmdbId = Number(tmdbId);
  const { authState } = useUserContext();
  const { isOwned } = useOwnedMediaContext();
  const {
    getRequest,
    isRequesting,
    refreshRequestStatus,
    requestMovieDownload,
  } = useDownloadRequestContext();

  const isAuthenticated = authState.authenticated;
  const owned = isOwned(numericTmdbId, mediaType);
  const downloadRequest = getRequest(numericTmdbId, mediaType);
  const downloadSubmitting = isRequesting(numericTmdbId);
  const canRetryDownload =
    downloadRequest?.status === "failed" || downloadRequest?.status === "not_found";
  const downloadDisabled =
    owned ||
    downloadSubmitting ||
    (!!downloadRequest && !canRetryDownload && downloadRequest.status !== "cancelled");

  useEffect(() => {
    if (isAuthenticated && mediaType === "movie") {
      refreshRequestStatus(numericTmdbId, mediaType);
    }
  }, [isAuthenticated, mediaType, numericTmdbId, refreshRequestStatus]);

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

  const handleDownload = async () => {
    if (!authState.authenticated) {
      router.push("/(modal)/login");
      return;
    }

    if (downloadDisabled && !canRetryDownload) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await requestMovieDownload(numericTmdbId);
    } catch {
      // Context already displays the error toast.
    }
  };

  const getDownloadActionTitle = () => {
    if (owned) return i18n.t("screen.detail.download.available");
    if (downloadSubmitting) return i18n.t("screen.detail.download.requesting");
    if (canRetryDownload) return i18n.t("screen.detail.download.retry");
    if (downloadRequest?.status === "downloading") {
      return i18n.t("screen.detail.download.downloading");
    }
    if (downloadRequest) return i18n.t("screen.detail.download.requested");
    return i18n.t("screen.detail.download.action");
  };

  const getDownloadActionIcon = () => {
    if (owned) return "checkmark.circle";
    if (downloadSubmitting || downloadRequest) return "clock";
    if (canRetryDownload) return "arrow.clockwise";
    return "tray.and.arrow.down";
  };

  const moreActions = [
    ...(mediaType === "movie"
      ? [
          {
            id: "download",
            title: getDownloadActionTitle(),
            icon: getDownloadActionIcon(),
            disabled: downloadDisabled && !canRetryDownload,
            onPress: handleDownload,
          },
        ]
      : []),
    {
      id: "addToWatchlist",
      title: i18n.t("screen.detail.actions.addToWatchlist"),
      icon: "plus.square.on.square",
      onPress: handleAddToWatchlist,
    },
  ];

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: "copy",
          label: i18n.t("screen.detail.actions.copy"),
          icon: "doc.on.doc",
          onPress: handleCopy,
        },
        {
          id: "more",
          label: "More actions",
          icon: "ellipsis",
          menu: moreActions,
        },
      ]}
    />
  );
}
