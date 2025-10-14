import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import { formatFullDate, formatYear } from "@/services/utils";
import useGenre from "@/hooks/useGenre";

type MediaCardProps = {
  data: TmdbData;
  mediaType?: string;
};

export default function MediaCard({ data, mediaType }: MediaCardProps) {
  const genre = useGenre(data, mediaType);
  const releaseDate = data.release_date || data.first_air_date;
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();

  // Calcul de la note sur 5 étoiles
  const rating = data.vote_average ? (data.vote_average / 2).toFixed(1) : null;

  return (
    <Link
      href={{
        pathname: "details/[id]",
        params: { type: data.media_type || mediaType, id: data.id },
      }}
      asChild
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
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: PlatformColor("label") }]}
              numberOfLines={1}
            >
              {data.title || data.name}
            </Text>

            {rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={THEME_COLORS.main} />
                <Text
                  style={[styles.rating, { color: PlatformColor("label") }]}
                >
                  {rating}
                </Text>
              </View>
            )}
          </View>

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
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    marginTop: 10,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.abril,
    fontSize: TOKENS.font.xxl,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  rating: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
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
