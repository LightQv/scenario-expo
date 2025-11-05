import { StyleSheet, View, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import { useMemo } from "react";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 650;

type WatchlistDetailBannerProps = {
  medias: APIMedia[];
  scrollY: SharedValue<number>;
};

export default function WatchlistDetailBanner({
  medias,
  scrollY,
}: WatchlistDetailBannerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  // Randomly select one media on component mount - using useMemo to maintain same selection during component lifecycle
  const randomMedia = useMemo(() => {
    if (!medias || medias.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * medias.length);
    return medias[randomIndex];
  }, [medias]); // Only recalculates if medias array reference changes

  // Parallax animation for the banner image (same formula as Banner component)
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
        {randomMedia ? (
          <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/original/${randomMedia.backdrop_path}`,
              }}
              alt={randomMedia.title}
              style={styles.image}
              contentFit="cover"
              placeholder={BLURHASH.hash}
              transition={BLURHASH.transition}
            />
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.imageContainer,
              animatedImageStyle,
              { backgroundColor: colors.main },
            ]}
          />
        )}
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

      {/* Bottom spacing for content overlap */}
      <View
        style={[
          styles.contentSpacer,
          { paddingBottom: insets.bottom / 2 || 16 },
        ]}
      />
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
  contentSpacer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
