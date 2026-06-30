import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { BUTTON, TOKENS } from "@/constants/theme";
import { notifyError } from "@/components/toasts/Toast";
import { useUserContext } from "@/contexts";
import useMediaBookmarkAction from "@/hooks/useMediaBookmarkAction";
import useMediaViewAction from "@/hooks/useMediaViewAction";
import i18n from "@/services/i18n";
import { colorWithAlpha, type DetailPalette } from "@/services/detailPalette";

type DetailsMediaControlsProps = {
  data: TmdbDetails;
  mediaType: string;
  tmdbId: string;
  videos?: Video[];
  backgroundColor?: string;
  actionColor: string;
  palette: DetailPalette;
};

function getMediaRuntime(data: TmdbDetails, type: string): number {
  if (type === "tv") {
    return data.number_of_episodes || 0;
  }

  return data.runtime || 0;
}

export default function DetailsMediaControls({
  data,
  mediaType,
  tmdbId,
  videos,
  backgroundColor,
  actionColor,
  palette,
}: DetailsMediaControlsProps) {
  const numericTmdbId = Number(tmdbId);
  const title = data.title || data.name || "";
  const releaseDate = data.release_date || data.first_air_date || "";
  const genreIds = data.genres?.map((genre) => genre.id) || [];
  const trailer = videos?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  const { authState } = useUserContext();

  const isAuthenticated = authState.authenticated;
  const { bookmarked, isProcessing: isBookmarkProcessing, toggleBookmark } =
    useMediaBookmarkAction(
      {
        tmdbId: numericTmdbId,
        title,
        posterPath: data.poster_path || "",
        backdropPath: data.backdrop_path || "",
        releaseDate,
        runtime: getMediaRuntime(data, mediaType),
        mediaType,
        genreIds,
      },
      { haptics: true },
    );
  const { viewed, isProcessing: isViewProcessing, toggleView } = useMediaViewAction(
    {
      tmdbId: numericTmdbId,
      genreIds: [0, ...genreIds],
      posterPath: data.poster_path || "",
      backdropPath: data.backdrop_path || data.poster_path || "",
      releaseDate,
      releaseYear: releaseDate.slice(0, 4),
      runtime: getMediaRuntime(data, mediaType),
      title,
      mediaType,
    },
    { haptics: true },
  );

  const handleTrailerPress = async () => {
    if (!trailer?.key) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    const youtubeAppUrl = `vnd.youtube://watch?v=${trailer.key}`;

    try {
      const canOpen = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpen) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        await WebBrowser.openBrowserAsync(youtubeUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          controlsColor: actionColor,
        });
      }
    } catch (error) {
      console.error("Error opening trailer:", error);
      notifyError(i18n.t("toast.error"));
    }
  };

  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      {isAuthenticated && (
        <DetailIconButton
          icon={bookmarked ? "bookmark" : "bookmark-outline"}
          onPress={toggleBookmark}
          disabled={isBookmarkProcessing}
          palette={palette}
        />
      )}

      <TouchableOpacity
        activeOpacity={BUTTON.opacity}
        disabled={!trailer}
        onPress={handleTrailerPress}
        style={[styles.trailerButton, !trailer && styles.disabledButton]}
      >
        <Ionicons name="play-circle" size={80} color={actionColor} />
      </TouchableOpacity>

      {isAuthenticated && (
        <DetailIconButton
          icon={viewed ? "eye" : "eye-outline"}
          onPress={toggleView}
          disabled={isViewProcessing}
          palette={palette}
        />
      )}
    </View>
  );
}

type DetailIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  palette: DetailPalette;
};

function DetailIconButton({
  icon,
  onPress,
  disabled = false,
  palette,
}: DetailIconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={BUTTON.opacity}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.iconButton,
        disabled && styles.disabledButton,
        {
          backgroundColor: colorWithAlpha(palette.text, 0.06),
          borderColor: colorWithAlpha(palette.text, 0.25),
        },
      ]}
    >
      <Ionicons name={icon} size={25} color={palette.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingTop: 0,
    paddingBottom: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  trailerButton: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.35,
  },
});
