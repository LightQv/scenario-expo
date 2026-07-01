import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts";
import useMediaViewAction from "@/hooks/useMediaViewAction";
import HeaderIconButton from "@/components/ui/HeaderIconButton";

function getMediaRuntime(data: TmdbData | TmdbDetails, type: string): number {
  if (type === "tv" && "number_of_episodes" in data) {
    return data.number_of_episodes || 0;
  }

  if ("runtime" in data) {
    return data.runtime || 0;
  }

  return 0;
}

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
  const { colors } = useThemeContext();

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
    return "number_of_seasons" in data ? "tv" : "movie";
  }, [mediaType, data]);

  // Use the data's ID and determined type
  const tmdbId = data.id;

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

  const backdrop =
    "backdrop_path" in data && data.backdrop_path
      ? data.backdrop_path
      : data.poster_path || "";
  const releaseDate = data.release_date || data.first_air_date || "";
  const { viewed, isProcessing, toggleView } = useMediaViewAction({
    tmdbId: Number(tmdbId),
    genreIds,
    posterPath: data.poster_path || "",
    backdropPath: backdrop,
    releaseDate,
    releaseYear: releaseDate.slice(0, 4),
    runtime: getMediaRuntime(data, type),
    title: data.title || data.name || "",
    mediaType: type,
  });

  if (size === "details") {
    return (
      <HeaderIconButton
        icon="eye"
        active={viewed}
        disabled={isProcessing}
        onPress={toggleView}
      />
    );
  }

  return (
    <Pressable
      onPress={toggleView}
      style={[styles.button, sizeStyles.container, style]}
      disabled={isProcessing}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="eye"
          size={sizeStyles.iconSize}
          color={viewed ? colors.main : "#fff"}
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
