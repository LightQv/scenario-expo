import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  PlatformColor,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { BLURHASH, TOKENS } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import i18n from "@/services/i18n";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 500;

type BannerProps = {
  src: string;
  alt?: string;
  score?: number;
  videos?: Video[];
  scrollY: SharedValue<number>;
};

export default function Banner({
  src,
  alt,
  score,
  videos,
  scrollY,
}: BannerProps) {
  const insets = useSafeAreaInsets();

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

  // Score display (TMDB rating out of 10)
  const displayScore = score ? (score / 2).toFixed(1) : null;

  // Find the first YouTube trailer
  const trailer = videos?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube",
  );
  const hasTrailer = !!trailer;

  // Handle trailer button press
  const handleTrailerPress = async () => {
    if (!trailer?.key) return;

    const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    const youtubeAppUrl = `vnd.youtube://watch?v=${trailer.key}`;

    try {
      // Try to open in YouTube app first
      const canOpen = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpen) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fallback to web browser (in-app)
        await WebBrowser.openBrowserAsync(youtubeUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          controlsColor: THEME_COLORS.main,
        });
      }
    } catch (error) {
      console.error("Error opening trailer:", error);
    }
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
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      {/* Bottom info bar */}
      <View
        style={[styles.infoBar, { paddingBottom: insets.bottom / 1.5 || 16 }]}
      >
        {hasTrailer && (
          <TouchableOpacity
            style={styles.trailerButton}
            activeOpacity={0.7}
            onPress={handleTrailerPress}
          >
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Animated.Text style={styles.trailerText}>
              {i18n.t("screen.detail.media.trailer")}
            </Animated.Text>
          </TouchableOpacity>
        )}

        {displayScore && (
          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={18} color={THEME_COLORS.main} />
            <Animated.Text
              style={[styles.scoreText, { color: PlatformColor("label") }]}
            >
              {displayScore}
            </Animated.Text>
          </View>
        )}
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
  infoBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingTop: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
  },
  trailerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME_COLORS.main,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  trailerText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
});
