import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  useColorScheme,
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
import { calculateAge, formatGender } from "@/services/utils";
import i18n from "@/services/i18n";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 650;

type BannerProps = {
  src: string;
  alt?: string;
  score?: number;
  title: string;
  genres?: Genre[];
  scrollY: SharedValue<number>;
  /* Person-specific props */
  gender?: number;
  birthday?: string | null;
  deathday?: string | null;
  knownForDepartment?: string;
};

export default function Banner({
  src,
  alt,
  score,
  title,
  genres,
  scrollY,
  gender,
  birthday,
  deathday,
  knownForDepartment,
}: BannerProps) {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const colorScheme = useColorScheme();

  const isPerson = type === "person";
  const age = birthday ? calculateAge(birthday, deathday) : null;

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

  const getBackgroundColor = () => {
    return colorScheme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)";
  };

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
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Content Section */}
      <View
        style={[
          styles.contentSection,
          { paddingBottom: insets.bottom / 2 || 16 },
        ]}
      >
        {/* Title Section - Centered */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {/* Genre Pills and Rating Badge - Centered on same row (or Gender/Age for person) */}
          <View style={styles.genreContainer}>
            {isPerson ? (
              <>
                {/* Gender */}
                {gender !== undefined && (
                  <View
                    style={[
                      styles.genrePill,
                      { backgroundColor: getBackgroundColor() },
                    ]}
                  >
                    <Text style={styles.genreText}>{formatGender(gender)}</Text>
                  </View>
                )}
                {/* Age */}
                {age !== null && (
                  <View
                    style={[
                      styles.genrePill,
                      { backgroundColor: getBackgroundColor() },
                    ]}
                  >
                    <Text style={styles.genreText}>
                      {age} {i18n.t("screen.person.age")}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Genre Pills - Show only first 2 */}
                {genres &&
                  genres.length > 0 &&
                  genres.slice(0, 2).map((genre) => (
                    <Link
                      href={{
                        pathname: "/discover",
                        params: { type, genreId: genre.id },
                      }}
                      key={genre.id}
                      asChild
                    >
                      <TouchableOpacity activeOpacity={BUTTON.opacity}>
                        <View
                          style={[
                            styles.genrePill,
                            { backgroundColor: getBackgroundColor() },
                          ]}
                        >
                          <Text style={styles.genreText}>{genre.name}</Text>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  ))}
                {/* Rating Badge */}
                {score && <RatingBadge score={score} size="detail" />}
              </>
            )}
          </View>
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
    height: "70%",
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
    gap: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  titleSection: {
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
    textAlign: "center",
    paddingHorizontal: TOKENS.margin.horizontal / 2,
    color: "#fff",
    fontFamily: FONTS.abril,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  genrePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  genreText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
    color: "#fff",
  },
});
