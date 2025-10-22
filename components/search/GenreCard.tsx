import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
  Dimensions,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import { TOKENS, FONTS } from "@/constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - TOKENS.margin.horizontal * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH / 2;

type GenreCardProps = {
  id: number;
  name: string;
};

export default function GenreCard({ id, name }: GenreCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Neutral gradient colors that adapt to theme
  const gradientColors = isDark
    ? ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.04)"]
    : ["rgba(0, 0, 0, 0.05)", "rgba(0, 0, 0, 0.02)"];

  return (
    <Link
      href={{
        pathname: "/search/[genreId]",
        params: { genreId: id, genreName: name },
      }}
      asChild
    >
      <TouchableOpacity style={styles.container} activeOpacity={0.7}>
        <View style={styles.card}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text
                style={[styles.genreName, { color: PlatformColor("label") }]}
                numberOfLines={2}
              >
                {name}
              </Text>
            </LinearGradient>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: CARD_GAP,
  },
  card: {
    flex: 1,
    borderRadius: TOKENS.radius.md,
    overflow: "hidden",
  },
  blurContainer: {
    flex: 1,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  genreName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
    textAlign: "center",
  },
});
