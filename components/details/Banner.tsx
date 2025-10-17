import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH, TOKENS, FONTS, BUTTON } from "@/constants/theme";
import RatingBadge from "@/components/ui/RatingBadge";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 500;

type BannerProps = {
  src: string;
  alt?: string;
  score?: number;
  title: string;
  genres: Genre[];
  scrollY: SharedValue<number>;
};

export default function Banner({
  src,
  alt,
  score,
  title,
  genres,
  scrollY,
}: BannerProps) {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();

  // Parallax animation for the banner image (same formula as previous version)
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
            [-BANNER_HEIGHT / 2, 0, BANNER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  // Fade out gradient as user scrolls
  const animatedGradientStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, BANNER_HEIGHT * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/original/${src}`,
            }}
            alt={alt}
            style={styles.image}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
        </Animated.View>
      </View>

      {/* Gradient overlay for better text readability */}
      <Animated.View style={[styles.gradientContainer, animatedGradientStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content Section */}
      <View
        style={[
          styles.contentSection,
          { paddingBottom: insets.bottom / 1.5 || 16 },
        ]}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text
            style={[styles.title, { color: "#fff", fontFamily: FONTS.abril }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {/* Genre Pills - Show only first 2 */}
          {genres && genres.length > 0 && (
            <View style={styles.genreContainer}>
              {genres.slice(0, 2).map((genre) => (
                <Link
                  href={{
                    pathname: "/discover",
                    params: { type, genreId: genre.id },
                  }}
                  key={genre.id}
                  asChild
                >
                  <TouchableOpacity
                    activeOpacity={BUTTON.opacity}
                    style={styles.genrePill}
                  >
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
        </View>

        {/* Genre Pills and Rating Row */}
        <View style={styles.bottomRow}>
          {/* Rating Badge */}
          {score && <RatingBadge score={score} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: BANNER_HEIGHT,
    position: "relative",
  },
  imageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  gradient: {
    flex: 1,
  },
  contentSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: TOKENS.margin.horizontal,
    gap: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleSection: {
    gap: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  originalTitle: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.light,
    fontStyle: "italic",
  },
  bottomRow: {
    gap: 8,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
  },
  genrePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
  },
  genreText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
    color: "#fff",
  },
});
