import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";
import { formatFullDate, formatYear } from "@/services/utils";
import useGenre from "@/hooks/useGenre";
import RatingBadge from "@/components/ui/RatingBadge";

type MediaCardProps = {
  data: TmdbData;
  mediaType?: string;
};

export default function MediaCard({ data, mediaType }: MediaCardProps) {
  const genre = useGenre(data, mediaType);
  const releaseDate = data.release_date || data.first_air_date;
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: data.media_type || mediaType, id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity style={styles.container} activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w342/${data.poster_path}`,
            }}
            alt={data.title || data.name}
            style={styles.image}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
          {data.vote_average && (
            <View style={styles.ratingBadge}>
              <RatingBadge score={data.vote_average} size="sm" />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.title, { color: PlatformColor("label") }]}
            numberOfLines={1}
          >
            {data.title || data.name}
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
              >
                {isUpcoming
                  ? formatFullDate(releaseDate)
                  : formatYear(releaseDate)}
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
    width: 180,
    marginRight: 14,
  },
  imageContainer: {
    width: 180,
    height: 265,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  content: {
    marginTop: 10,
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
    flex: 1,
  },
  year: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
  },
});
