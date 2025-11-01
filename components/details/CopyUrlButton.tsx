import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { CONFIG } from "@/services/config";
import { notifySuccess, notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";
import { TOKENS } from "@/constants/theme";

type CopyUrlButtonProps = {
  mediaType: string;
  tmdbId: string;
  title?: string;
};

export default function CopyUrlButton({ mediaType, tmdbId }: CopyUrlButtonProps) {
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
      <Ionicons name="copy-outline" size={TOKENS.icon} color={colors.text} />
    </Pressable>
  );
}
