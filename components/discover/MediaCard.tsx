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
import { formatFullDate, formatYear } from "@/services/utils";
import useGenre from "@/hooks/useGenre";
import RatingBadge from "@/components/ui/RatingBadge";
import ViewAction from "@/components/actions/ViewAction";
import { useUserContext } from "@/contexts/UserContext";

type MediaCardProps = {
  data: TmdbData;
  mediaType?: string;
  size?: "sm" | "md" | "xl" | "grid";
};

export default function MediaCard({
  data,
  mediaType,
  size = "sm",
}: MediaCardProps) {
  const { authState } = useUserContext();
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
      case "grid":
      case "sm":
      default:
        return `${basePath}w342/${data.poster_path}`; // Standard quality for sm and grid
    }
  };

  // Map card size to rating badge size
  const getRatingSize = (): "sm" | "md" | "xl" => {
    if (size === "grid") return "sm"; // Grid uses sm badge
    return size; // Direct mapping: sm -> sm, md -> md, xl -> xl
  };

  const componentStyles = mediaCardStyles[size];
  const hasValidRating =
    typeof data.vote_average === "number" && data.vote_average > 0;

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: data.media_type || mediaType, id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity
        style={componentStyles.container}
        activeOpacity={BUTTON.opacity}
      >
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
          {/* ViewAction button - top right corner (only when authenticated) */}
          {authState.authenticated && (
            <ViewAction
              data={data}
              mediaType={data.media_type || mediaType}
              size={size === "grid" ? "sm" : size}
              style={sharedStyles.viewAction}
            />
          )}
          {/* RatingBadge - bottom right corner */}
          {hasValidRating && (
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
  viewAction: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

const mediaCardStyles = {
  grid: StyleSheet.create({
    container: {
      width: TOKENS.card.sizes.grid.width,
    },
    imageContainer: {
      width: TOKENS.card.sizes.grid.width,
      height: TOKENS.card.sizes.grid.height,
      borderRadius: TOKENS.card.sizes.grid.borderRadius,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: TOKENS.card.sizes.grid.contentMarginTop,
      gap: TOKENS.card.sizes.grid.contentGap,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.card.sizes.grid.titleFontSize,
      lineHeight: TOKENS.card.sizes.grid.titleLineHeight,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: TOKENS.card.sizes.grid.metaGap,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.grid.metaFontSize,
      flex: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.grid.metaFontSize,
      color: PlatformColor("secondaryLabel"),
    },
  }),
  sm: StyleSheet.create({
    container: {
      width: TOKENS.card.sizes.sm.width,
    },
    imageContainer: {
      width: TOKENS.card.sizes.sm.width,
      height: TOKENS.card.sizes.sm.height,
      borderRadius: TOKENS.card.sizes.sm.borderRadius,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: TOKENS.card.sizes.sm.contentMarginTop,
      gap: TOKENS.card.sizes.sm.contentGap,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.card.sizes.sm.titleFontSize,
      lineHeight: TOKENS.card.sizes.sm.titleLineHeight,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: TOKENS.card.sizes.sm.metaGap,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.sm.metaFontSize,
      flex: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.sm.metaFontSize,
      color: PlatformColor("secondaryLabel"),
    },
  }),
  md: StyleSheet.create({
    container: {
      width: TOKENS.card.sizes.md.width,
    },
    imageContainer: {
      width: TOKENS.card.sizes.md.width,
      height: TOKENS.card.sizes.md.height,
      borderRadius: TOKENS.card.sizes.md.borderRadius,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: TOKENS.card.sizes.md.contentMarginTop,
      gap: TOKENS.card.sizes.md.contentGap,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.card.sizes.md.titleFontSize,
      lineHeight: TOKENS.card.sizes.md.titleLineHeight,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: TOKENS.card.sizes.md.metaGap,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.md.metaFontSize,
      flex: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.md.metaFontSize,
      color: PlatformColor("secondaryLabel"),
    },
  }),
  xl: StyleSheet.create({
    container: {
      width: TOKENS.card.sizes.xl.width,
    },
    imageContainer: {
      width: TOKENS.card.sizes.xl.width,
      height: TOKENS.card.sizes.xl.height,
      borderRadius: TOKENS.card.sizes.xl.borderRadius,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
      position: "relative",
    },
    content: {
      marginTop: TOKENS.card.sizes.xl.contentMarginTop,
      gap: TOKENS.card.sizes.xl.contentGap,
    },
    title: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.card.sizes.xl.titleFontSize,
      lineHeight: TOKENS.card.sizes.xl.titleLineHeight,
      color: PlatformColor("label"),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: TOKENS.card.sizes.xl.metaGap,
    },
    genre: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.xl.metaFontSize,
      flex: 1,
      flexShrink: 1,
      color: PlatformColor("secondaryLabel"),
    },
    year: {
      fontFamily: FONTS.regular,
      fontSize: TOKENS.card.sizes.xl.metaFontSize,
      flexShrink: 0,
      color: PlatformColor("secondaryLabel"),
    },
  }),
};
