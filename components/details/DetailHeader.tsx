import {
  StyleSheet,
  Text,
  View,
  PlatformColor,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { TOKENS, FONTS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts";

type DetailHeaderProps = {
  /* Overall type */
  overview?: string;
  videos?: Video[];

  /* Person type */
  biography?: string;
  backgroundColor?: string;
  textColor?: string;
  actionBackgroundColor?: string;
  actionTextColor?: string;
};

export default function DetailHeader({
  overview,
  videos,
  biography,
  backgroundColor,
  textColor,
  actionBackgroundColor,
  actionTextColor,
}: DetailHeaderProps) {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { colors } = useThemeContext();
  const isPerson = type === "person";
  const displayText = isPerson ? biography : overview;

  // Find the first YouTube trailer
  const trailer = videos?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );
  const hasTrailer = !!trailer;

  // Handle trailer button press
  const handleTrailerPress = async () => {
    if (!trailer?.key) return;

    const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    const youtubeAppUrl = `vnd.youtube://watch?v=${trailer.key}`;

    try {
      // Try to open in YouTube app first
      const canOpen = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpen) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fallback to web browser (in-app)
        await WebBrowser.openBrowserAsync(youtubeUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          controlsColor: actionBackgroundColor || colors.main,
        });
      }
    } catch (error) {
      console.error("Error opening trailer:", error);
    }
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => (
      <Text key={index}>
        {line.trim()}
        {index < lines.length - 1 && (
          <Text style={{ lineHeight: 6 }}>{"\n"}</Text>
        )}
      </Text>
    ));
  };

  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      {/* Trailer Button */}
      {hasTrailer && (
        <TouchableOpacity
          style={[
            styles.trailerButton,
            { backgroundColor: actionBackgroundColor || colors.main },
          ]}
          activeOpacity={BUTTON.opacity}
          onPress={handleTrailerPress}
        >
          <Ionicons
            name="play-circle"
            size={TOKENS.icon}
            color={actionTextColor || "#000"}
          />
          <Text
            style={[styles.trailerText, { color: actionTextColor || "#000" }]}
          >
            {i18n.t("screen.detail.media.trailer")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Synopsis/Biography Section */}
      <View>
        <Text
          style={[
            styles.synopsisText,
            { color: textColor || PlatformColor("label") },
          ]}
        >
          {renderFormattedText(
            displayText ||
              (isPerson
                ? i18n.t("error.noBiography")
                : i18n.t("error.noSynopsis")),
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingTop: 0,
    paddingBottom: TOKENS.margin.vertical * 2,
    gap: 16,
    backgroundColor: PlatformColor("systemBackground"),
  },
  trailerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: "stretch",
  },
  trailerText: {
    fontSize: 15,
    fontWeight: "600",
  },
  synopsisText: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
});
