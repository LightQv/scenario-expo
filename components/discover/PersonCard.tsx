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
import { FONTS, TOKENS, BLURHASH, BUTTON } from "@/constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

type PersonCardProps = {
  data: TmdbData;
  size?: "sm" | "md" | "xl" | "grid";
};

export default function PersonCard({ data, size = "sm" }: PersonCardProps) {
  // Choose profile quality based on size
  const getProfileUrl = () => {
    if (!data.profile_path) return null;
    const basePath = "https://image.tmdb.org/t/p/";
    switch (size) {
      case "xl":
        return `${basePath}w780/${data.profile_path}`; // Higher quality for xl
      case "md":
        return `${basePath}h632/${data.profile_path}`; // Medium-high quality for md
      case "grid":
      case "sm":
      default:
        return `${basePath}w342/${data.profile_path}`; // Standard quality for sm and grid
    }
  };

  const profileUrl = getProfileUrl();
  const componentStyles = personCardStyles[size];

  return (
    <Link
      href={{
        pathname: "/details/[id]",
        params: { type: "person", id: data.id.toString() },
      }}
      asChild
      push
    >
      <TouchableOpacity style={componentStyles.container} activeOpacity={BUTTON.opacity}>
        <View style={componentStyles.imageContainer}>
          {profileUrl ? (
            <Image
              source={{ uri: profileUrl }}
              alt={data.name}
              style={sharedStyles.image}
              contentFit="cover"
              placeholder={BLURHASH.hash}
              transition={BLURHASH.transition}
            />
          ) : (
            <View
              style={[
                sharedStyles.image,
                sharedStyles.placeholderImage,
                { backgroundColor: PlatformColor("systemGray4") },
              ]}
            >
              <Text
                style={[
                  componentStyles.placeholderText,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {data.name?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={componentStyles.content}>
          <Text style={componentStyles.personName} numberOfLines={2}>
            {data.name}
          </Text>
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
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
});

const personCardStyles = {
  grid: StyleSheet.create({
    container: {
      width: (SCREEN_WIDTH - TOKENS.margin.horizontal * 2 - 14) / 2,
    },
    imageContainer: {
      width: (SCREEN_WIDTH - TOKENS.margin.horizontal * 2 - 14) / 2,
      height: (SCREEN_WIDTH - TOKENS.margin.horizontal * 2 - 14) / 2, // Square for grid
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
    },
    content: {
      marginTop: 6,
    },
    personName: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.xxl,
      lineHeight: 18,
      color: PlatformColor("label"),
    },
    placeholderText: {
      fontFamily: FONTS.bold,
      fontSize: 48,
    },
  }),
  sm: StyleSheet.create({
    container: {
      width: 140,
    },
    imageContainer: {
      width: 140,
      height: 140,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
    },
    content: {
      marginTop: 6,
    },
    personName: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.xxl,
      lineHeight: 18,
      color: PlatformColor("label"),
    },
    placeholderText: {
      fontFamily: FONTS.bold,
      fontSize: 48,
    },
  }),
  md: StyleSheet.create({
    container: {
      width: 210,
    },
    imageContainer: {
      width: 210,
      height: 210,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
    },
    content: {
      marginTop: 8,
    },
    personName: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.title,
      lineHeight: 27,
      color: PlatformColor("label"),
    },
    placeholderText: {
      fontFamily: FONTS.bold,
      fontSize: 72,
    },
  }),
  xl: StyleSheet.create({
    container: {
      width: SCREEN_WIDTH - TOKENS.margin.horizontal * 2,
    },
    imageContainer: {
      width: SCREEN_WIDTH - TOKENS.margin.horizontal * 2,
      height: SCREEN_WIDTH - TOKENS.margin.horizontal * 2,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: PlatformColor("systemGray5"),
    },
    content: {
      marginTop: 14,
    },
    personName: {
      fontFamily: FONTS.bold,
      fontSize: TOKENS.font.title,
      lineHeight: 24,
      color: PlatformColor("label"),
    },
    placeholderText: {
      fontFamily: FONTS.bold,
      fontSize: 96,
    },
  }),
};
