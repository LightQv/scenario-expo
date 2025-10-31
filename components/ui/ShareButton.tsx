import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { CONFIG } from "@/services/config";
import { notifySuccess, notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";

type ShareButtonProps = {
  mediaType: string;
  tmdbId: string;
  title?: string;
};

export default function ShareButton({ mediaType, tmdbId }: ShareButtonProps) {
  const { colors } = useThemeContext();

  const handleCopy = async () => {
    try {
      const url = `${CONFIG.webClientUrl}/detail/${mediaType}/${tmdbId}`;
      await Clipboard.setStringAsync(url);
      notifySuccess(i18n.t("toast.success.urlCopied"));
    } catch (error) {
      notifyError(i18n.t("toast.error"));
    }
  };

  return (
    <Pressable onPress={handleCopy}>
      <Ionicons name="copy-outline" size={24} color={colors.text} />
    </Pressable>
  );
}
