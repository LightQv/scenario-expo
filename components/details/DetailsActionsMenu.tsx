import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { CONFIG } from "@/services/config";
import { notifySuccess, notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import HeaderMenu from "@/components/ui/HeaderMenu";

type DetailsActionsMenuProps = {
  mediaType: string;
  tmdbId: string;
  title: string;
};

export default function DetailsActionsMenu({
  mediaType,
  tmdbId,
  title,
}: DetailsActionsMenuProps) {
  const handleCopy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const url = `${CONFIG.webClientUrl}/details/${mediaType}/${tmdbId}`;
      await Clipboard.setStringAsync(url);
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
    <HeaderMenu
      label="More actions"
      actions={[
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
      ]}
    />
  );
}
