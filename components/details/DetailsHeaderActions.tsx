import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
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
          id: "copy",
          label: i18n.t("screen.detail.actions.copy"),
          icon: "doc.on.doc",
          onPress: handleCopy,
        },
        {
          id: "more",
          label: "More actions",
          icon: "ellipsis",
          menu: [
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
