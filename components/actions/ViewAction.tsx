import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUserContext, useViewContext, useThemeContext } from "@/contexts";
import { notifyError } from "@/components/toasts/Toast";
import useView from "@/hooks/useView";
import i18n from "@/services/i18n";

type ViewActionProps = {
  data: TmdbData | TmdbDetails;
  mediaType?: string; // Optional override for media type (movie or tv)
  size?: "sm" | "md" | "xl" | "details"; // Size variant
  style?: ViewStyle;
};

export default function ViewAction({
  data,
  mediaType,
  size = "details",
  style = {},
}: ViewActionProps) {
  const router = useRouter();
  const { user, authState } = useUserContext();
  const { addView, removeView } = useViewContext();
  const { colors } = useThemeContext();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get size-specific styles
  const sizeStyles = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          container: styles.containerSm,
          iconSize: 14,
        };
      case "md":
        return {
          container: styles.containerMd,
          iconSize: 18,
        };
      case "xl":
        return {
          container: styles.containerXl,
          iconSize: 22,
        };
      case "details":
        return {
          container: styles.containerDetails,
          iconSize: 24,
        };
    }
  }, [size]);

  // Determine media type from prop, data.media_type, or infer from data structure
  const type = useMemo(() => {
    if (mediaType) return mediaType;
    if (data.media_type) return data.media_type;
    // Infer from data structure: TV shows have number_of_seasons
    return data.number_of_seasons !== undefined ? "tv" : "movie";
  }, [mediaType, data.media_type, data.number_of_seasons]);

  // Use the data's ID and determined type
  const tmdbId = data.id;
  const { viewed, viewObj } = useView(tmdbId, type);

  // Extract genre IDs from data (memoized)
  // Handle both TmdbData (genre_ids) and TmdbDetails (genres)
  const genreIds = useMemo(() => {
    // TmdbDetails has genres array of objects
    if ("genres" in data && data.genres) {
      const ids = data.genres.map((genre) => genre.id);
      return [0, ...ids];
    }
    // TmdbData has genre_ids array of numbers
    if ("genre_ids" in data && data.genre_ids) {
      return [0, ...data.genre_ids];
    }
    return [0];
  }, [data]);

  const handleView = async () => {
    // Redirect to login if not authenticated
    if (!authState.authenticated || !user) {
      router.push("/(modal)/login");
      return;
    }

    // Prevent multiple simultaneous requests
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (viewed && viewObj) {
        // Remove view
        await removeView(viewObj.id);
      } else {
        // Add view - all data comes from props
        // Get runtime (TmdbDetails) or default to 0 (TmdbData)
        const runtime =
          "runtime" in data
            ? data.runtime
            : "number_of_episodes" in data
              ? data.number_of_episodes
              : 0;

        // Get backdrop (TmdbDetails) or poster (TmdbData fallback)
        const backdrop =
          "backdrop_path" in data && data.backdrop_path
            ? data.backdrop_path
            : data.poster_path || "";

        const viewData: ViewCreate = {
          tmdb_id: Number(tmdbId),
          genre_ids: genreIds,
          poster_path: data.poster_path || "",
          backdrop_path: backdrop,
          release_date: data.release_date || data.first_air_date || "",
          release_year:
            data.release_date?.slice(0, 4) ||
            data.first_air_date?.slice(0, 4) ||
            "",
          runtime: runtime || 0,
          title: data.title || data.name || "",
          media_type: type,
          viewer_id: user.id,
        };

        await addView(viewData);
      }
    } catch (error) {
      console.error("Error handling view:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Pressable
      onPress={handleView}
      style={[styles.button, sizeStyles.container, style]}
      disabled={isProcessing}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="eye"
          size={sizeStyles.iconSize}
          color={
            viewed ? colors.main : size === "details" ? colors.text : "#fff"
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Details size (header button)
  containerDetails: {
    marginLeft: 0,
    padding: 0,
  },
  // Small size (180px MediaCard)
  containerSm: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Medium size (270px MediaCard)
  containerMd: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Extra large size (full width MediaCard)
  containerXl: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
