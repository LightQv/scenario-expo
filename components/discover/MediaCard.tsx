import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FONTS, TOKENS, BLURHASH } from "@/constants/theme";
import { formatFullDate, formatYear } from "@/services/utils";
import useGenre from "@/hooks/useGenre";
import RatingBadge from "@/components/ui/RatingBadge";

const SCREEN_WIDTH = Dimensions.get("window").width;

type MediaCardProps = {
  data: TmdbData;
  mediaType?: string;
  size?: "sm" | "md" | "xl";
};

export default function MediaCard({
  data,
  mediaType,
  size = "sm",
}: MediaCardProps) {
  const genre = useGenre(data, mediaType);
  const releaseDate = data.release_date || data.first_air_date;
  const isUpcoming = releaseDate && new Date(releaseDate) > new Date();

  // Choose poster quality based on size
  const getPosterUrl = () => {
    const basePath = "https://image.tmdb.org/t/p/";
    switch (size) {
      case "xl":
        return `${basePath}w780/${data.poster_path}`; // Higher quality for xl
      case "md":
        return `${basePath}w500/${data.poster_path}`; // Medium-high quality for md
      case "sm":
      default:
        return `${basePath}w342/${data.poster_path}`; // Standard quality for sm
    }
  };

  // Map card size to rating badge size
  const getRatingSize = (): "sm" | "md" | "xl" => {
    return size; // Direct mapping: sm -> sm, md -> md, xl -> xl
  };

  const componentStyles = mediaCardStyles[size];

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: data.media_type || mediaType, id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity style={componentStyles.container} activeOpacity={0.7}>
        <View style={componentStyles.imageContainer}>
          <Image
            source={{
              uri: getPosterUrl(),
            }}
            alt={data.title || data.name}
            style={sharedStyles.image}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
          {data.vote_average && (
            <View style={sharedStyles.ratingBadge}>
              <RatingBadge score={data.vote_average} size={getRatingSize()} />
            </View>
          )}
        </View>

        <View style={componentStyles.content}>
          <Text style={componentStyles.title} numberOfLines={1}>
            {data.title || data.name}
          </Text>

          <View style={componentStyles.metaRow}>
            {genre && genre.length > 0 && (
              <Text style={componentStyles.genre} numberOfLines={1}>
                {genre[0]}
              </Text>
            )}

            {releaseDate && (
              <Text style={componentStyles.year} numberOfLines={1}>
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

const sharedStyles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
});

const mediaCardStyles = {
  sm: StyleSheet.create({
    container: {
      width: 180,
    },
    imageContainer: {
      width: 180,
      height: 265,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: 6,
      gap: 2,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.xxl,
      lineHeight: 18,
      color: PlatformColor("label"),
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
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.font.xs,
      color: PlatformColor("secondaryLabel"),
    },
  }),
  md: StyleSheet.create({
    container: {
      width: 270,
    },
    imageContainer: {
      width: 270,
      height: 398,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: 8,
      gap: 2,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.title,
      lineHeight: 27,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.font.xxl,
      flex: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.font.xxl,
      color: PlatformColor("secondaryLabel"),
    },
  }),
  xl: StyleSheet.create({
    container: {
      width: SCREEN_WIDTH - TOKENS.margin.horizontal * 2,
    },
    imageContainer: {
      width: SCREEN_WIDTH - TOKENS.margin.horizontal * 2,
      height: Math.round((SCREEN_WIDTH - TOKENS.margin.horizontal * 2) * 1.47),
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: 14,
      gap: 6,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.title,
      lineHeight: 24,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.font.md,
      flex: 1,
      flexShrink: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.font.md,
      flexShrink: 0,
      color: PlatformColor("secondaryLabel"),
    },
  }),
};
