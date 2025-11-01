import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FONTS, TOKENS, BLURHASH, BUTTON } from "@/constants/theme";
import { formatYear } from "@/services/utils";
import useGenre from "@/hooks/useGenre";

type HorizontalMediaCardProps = {
  data: PersonMovieCredit | PersonTvCredit;
  mediaType: "movie" | "tv";
};

export default function HorizontalMediaCard({
  data,
  mediaType,
}: HorizontalMediaCardProps) {
  const genre = useGenre(data, mediaType);
  const releaseDate =
    "release_date" in data ? data.release_date : data.first_air_date;
  const title = "title" in data ? data.title : data.name;

  const posterUrl = data.poster_path
    ? `https://image.tmdb.org/t/p/w342/${data.poster_path}`
    : null;

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: mediaType, id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity style={styles.container} activeOpacity={BUTTON.opacity}>
        {/* Poster on the left */}
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              alt={title}
              style={styles.poster}
              contentFit="cover"
              placeholder={BLURHASH.hash}
              transition={BLURHASH.transition}
            />
          ) : (
            <View
              style={[
                styles.poster,
                styles.placeholderPoster,
                { backgroundColor: PlatformColor("systemGray4") },
              ]}
            >
              <Text
                style={[
                  styles.placeholderText,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {title?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        {/* Content on the right */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: PlatformColor("label") }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          <View style={styles.metaRow}>
            {genre && genre.length > 0 && (
              <Text
                style={[
                  styles.genre,
                  { color: PlatformColor("secondaryLabel") },
                ]}
                numberOfLines={1}
              >
                {genre[0]}
              </Text>
            )}
            {releaseDate && (
              <Text
                style={[
                  styles.year,
                  { color: PlatformColor("secondaryLabel") },
                ]}
                numberOfLines={1}
              >
                {formatYear(releaseDate)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  posterContainer: {
    width: 60,
    height: 88, // Maintain 2:3 aspect ratio
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  placeholderPoster: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  genre: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
  },
  year: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
  },
});
