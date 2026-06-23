import { StyleSheet, View, Dimensions, Text, ColorValue } from "react-native";
import { Image } from "expo-image";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BLURHASH, TOKENS, FONTS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import { colorWithAlpha } from "@/services/detailPalette";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 530;

type ProfileBannerProps = {
  bannerUrl: string | undefined;
  username: string;
  email: string;
  scrollY: SharedValue<number>;
  backgroundColor: ColorValue;
  fadeBackgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
};

export default function ProfileBanner({
  bannerUrl,
  username,
  email,
  scrollY,
  backgroundColor,
  fadeBackgroundColor,
  textColor,
  secondaryTextColor,
}: ProfileBannerProps) {
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

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
            <View style={[styles.image, { backgroundColor: colors.main }]} />
          )}
        </Animated.View>
      </View>

      <View pointerEvents="none" style={styles.gradientContainer}>
        {bannerUrl && (
          <MaskedView
            style={StyleSheet.absoluteFill}
            maskElement={
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0)",
                  "rgba(0,0,0,0)",
                  "rgba(0,0,0,0.06)",
                  "rgba(0,0,0,0.3)",
                  "rgba(0,0,0,0.66)",
                  "rgba(0,0,0,1)",
                ]}
                locations={[0, 0.38, 0.54, 0.72, 0.92, 1]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
              />
            }
          >
            <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
              <Image
                source={{ uri: bannerUrl }}
                alt={`${username} banner`}
                style={styles.image}
                contentFit="cover"
                blurRadius={340}
                cachePolicy="none"
              />
            </Animated.View>
          </MaskedView>
        )}
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            colorWithAlpha(fadeBackgroundColor, 0.22),
            colorWithAlpha(fadeBackgroundColor, 0.54),
            colorWithAlpha(fadeBackgroundColor, 0.82),
            colorWithAlpha(fadeBackgroundColor, 0.96),
            fadeBackgroundColor,
          ]}
          locations={[0, 0.44, 0.58, 0.7, 0.82, 0.92, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.16)",
            "transparent",
          ]}
          locations={[0, 0.44, 0.62, 0.78, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Username as title - Centered */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {username}
          </Text>
          <Text
            style={[styles.email, { color: secondaryTextColor }]}
            numberOfLines={1}
          >
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
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
    paddingBottom: 24,
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
    fontFamily: FONTS.abril,
  },
  email: {
    fontSize: TOKENS.font.lg,
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
});
