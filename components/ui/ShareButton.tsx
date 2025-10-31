import { Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { CONFIG } from "@/services/config";
import { notifySuccess, notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";

type ShareButtonProps = {
  mediaType: string;
  tmdbId: string;
  title?: string;
};

export default function ShareButton({ mediaType, tmdbId }: ShareButtonProps) {
  const colorScheme = useColorScheme();

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
      <Ionicons
        name="copy-outline"
        size={24}
        color={colorScheme === "dark" ? "#fff" : "#000"}
      />
    </Pressable>
  );
}
