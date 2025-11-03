import { TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { BUTTON, TOKENS } from "@/constants/theme";
import { useBookmarkContext, useThemeContext } from "@/contexts";
import { formatYear } from "@/services/utils";

type BookmarkButtonProps = {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string;
  backdropPath: string;
  releaseDate?: string;
  firstAirDate?: string;
  runtime?: number;
  genreIds?: number[];
};

export default function BookmarkButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  firstAirDate,
  runtime,
  genreIds = [],
}: BookmarkButtonProps) {
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkByTmdbId } =
    useBookmarkContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const { colors } = useThemeContext();

  const bookmarked = isBookmarked(tmdbId, mediaType);

  const handlePress = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (bookmarked) {
        // Remove bookmark
        const bookmark = getBookmarkByTmdbId(tmdbId, mediaType);
        if (bookmark) {
          await removeBookmark(bookmark.id);
        }
      } else {
        // Add bookmark
        const date = releaseDate || firstAirDate || "";
        const releaseYear = date ? formatYear(date) : "";

        await addBookmark({
          tmdb_id: tmdbId,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          release_date: date,
          release_year: releaseYear,
          runtime: runtime || 0,
          media_type: mediaType,
          genre_ids: genreIds,
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return <ActivityIndicator size="small" color="#fff" />;
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={BUTTON.opacity}>
      <Ionicons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={TOKENS.icon}
        color={bookmarked ? colors.main : "#fff"}
      />
    </TouchableOpacity>
  );
}
