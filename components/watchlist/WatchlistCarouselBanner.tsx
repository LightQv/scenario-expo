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
import Carousel from "react-native-reanimated-carousel";
import { BLURHASH } from "@/constants/theme";
import { useThemeContext } from "@/contexts";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 650;

type WatchlistCarouselBannerProps = {
  medias: APIMedia[];
  scrollY: SharedValue<number>;
};

export default function WatchlistCarouselBanner({
  medias,
  scrollY,
}: WatchlistCarouselBannerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  // Parallax animation for the banner (same formula as Banner component)
  const animatedCarouselStyle = useAnimatedStyle(() => {
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

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: APIMedia;
    index: number;
  }) => (
    <Image
      source={{
        uri: `https://image.tmdb.org/t/p/original/${item.backdrop_path}`,
      }}
      alt={`${item.title}-${index}`}
      key={`${item.id}-${index}`}
      style={styles.image}
      contentFit="cover"
      placeholder={BLURHASH.hash}
      transition={BLURHASH.transition}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Animated.View style={[styles.imageContainer, animatedCarouselStyle]}>
          {medias && medias.length > 0 ? (
            <Carousel
              width={width}
              height={BANNER_HEIGHT}
              loop
              autoPlay={medias.length > 1}
              enabled={false}
              scrollAnimationDuration={1500}
              autoPlayInterval={5000}
              snapEnabled={false}
              data={medias}
              renderItem={renderCarouselItem}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 1,
                parallaxScrollingOffset: 0,
                parallaxAdjacentItemScale: 1,
              }}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: colors.main }]} />
          )}
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
