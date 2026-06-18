import { ActivityIndicator } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useBookmarkContext, useThemeContext } from "@/contexts";
import HeaderIconButton from "@/components/ui/HeaderIconButton";

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

        await addBookmark({
          tmdb_id: tmdbId,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          release_date: date,
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
    <HeaderIconButton
      icon={bookmarked ? "bookmark" : "bookmark-outline"}
      active={bookmarked}
      onPress={handlePress}
      disabled={isProcessing}
    />
  );
}
