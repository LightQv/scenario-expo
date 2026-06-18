import {
  Linking,
  PlatformColor,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { BUTTON, TOKENS } from "@/constants/theme";
import { notifyError } from "@/components/toasts/Toast";
import { useBookmarkContext, useUserContext, useViewContext } from "@/contexts";
import useView from "@/hooks/useView";
import i18n from "@/services/i18n";

type DetailsMediaControlsProps = {
  data: TmdbDetails;
  mediaType: string;
  tmdbId: string;
  videos?: Video[];
  backgroundColor?: string;
  actionColor: string;
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
}: DetailsMediaControlsProps) {
  const numericTmdbId = Number(tmdbId);
  const title = data.title || data.name || "";
  const releaseDate = data.release_date || data.first_air_date || "";
  const genreIds = data.genres?.map((genre) => genre.id) || [];
  const trailer = videos?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );

  const { user, authState } = useUserContext();
  const { addView, removeView } = useViewContext();
  const { viewed, viewObj } = useView(numericTmdbId, mediaType);
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkByTmdbId } =
    useBookmarkContext();

  const isAuthenticated = authState.authenticated;
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

  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      {isAuthenticated && (
        <GlassIconButton
          icon={bookmarked ? "bookmark" : "bookmark-outline"}
          active={bookmarked}
          onPress={handleBookmark}
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
        <GlassIconButton
          icon={viewed ? "eye" : "eye-outline"}
          active={viewed}
          onPress={handleView}
        />
      )}
    </View>
  );
}

type GlassIconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
};

function GlassIconButton({ icon, active, onPress }: GlassIconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={BUTTON.opacity}
      onPress={onPress}
      style={styles.glassButtonWrapper}
    >
      <GlassView style={styles.glassButton}>
        <Ionicons
          name={icon}
          size={22}
          color={active ? PlatformColor("label") : PlatformColor("label")}
        />
      </GlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingTop: 0,
    paddingBottom: 0,
  },
  glassButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: TOKENS.radius.full,
    overflow: "hidden",
  },
  glassButton: {
    width: "100%",
    height: "100%",
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PlatformColor("primarySystemFill"),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
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
