import { StyleSheet, View, Dimensions, Text } from "react-native";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLURHASH, TOKENS, FONTS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 650;

type ProfileBannerProps = {
  bannerUrl: string | undefined;
  username: string;
  email: string;
  scrollY: SharedValue<number>;
};

export default function ProfileBanner({
  bannerUrl,
  username,
  email,
  scrollY,
}: ProfileBannerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  // Parallax animation for the banner image
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
          {bannerUrl ? (
            <Image
              source={{ uri: bannerUrl }}
              alt={`${username} banner`}
              style={styles.image}
              contentFit="cover"
              placeholder={BLURHASH.hash}
              transition={BLURHASH.transition}
              cachePolicy="none"
            />
          ) : (
            <View
              style={[styles.image, { backgroundColor: colors.main }]}
            />
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

      {/* Content Section */}
      <View
        style={[
          styles.contentSection,
          { paddingBottom: insets.bottom / 2 || 16 },
        ]}
      >
        {/* Username as title - Centered */}
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {username}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
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
    gap: 6,
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
  email: {
    fontSize: TOKENS.font.lg,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: FONTS.regular,
  },
});
