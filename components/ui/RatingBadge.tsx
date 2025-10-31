import { StyleSheet, View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME_COLORS } from "@/constants/theme/colors";

type RatingBadgeProps = {
  score: number;
  size?: "sm" | "md" | "xl" | "detail";
};

export default function RatingBadge({ score, size = "xl" }: RatingBadgeProps) {
  const colorScheme = useColorScheme();
  // Convert TMDB score (0-10) to 0-5 scale
  const displayScore = (score / 2).toFixed(1);

  // Theme-based background color for detail size
  const getBackgroundColor = () => {
    if (size === "detail") {
      return colorScheme === "dark"
        ? "rgba(255,255,255,0.2)" // Same as genre pills in dark mode
        : "rgba(0,0,0,0.5)"; // Same as default rating badge in light mode
    }
    return "rgba(0,0,0,0.5)"; // Default for other sizes
  };

  const getStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: styles.containerSm,
          text: styles.scoreTextSm,
          iconSize: 11,
        };
      case "md":
        return {
          container: styles.containerMd,
          text: styles.scoreTextMd,
          iconSize: 14,
        };
      case "detail":
        return {
          container: styles.containerDetail,
          text: styles.scoreTextDetail,
          iconSize: 14,
        };
      case "xl":
      default:
        return {
          container: styles.containerXl,
          text: styles.scoreTextXl,
          iconSize: 18,
        };
    }
  };

  const sizeStyles = getStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: getBackgroundColor() },
      ]}
    >
      <Ionicons
        name="star"
        size={sizeStyles.iconSize}
        color={THEME_COLORS.main}
      />
      <Text style={[styles.scoreText, { color: "#fff" }, sizeStyles.text]}>
        {displayScore}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    marginLeft: "auto",
  },
  containerSm: {
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  containerMd: {
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  containerDetail: {
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  containerXl: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    fontWeight: "600",
  },
  scoreTextSm: {
    fontSize: 11,
  },
  scoreTextMd: {
    fontSize: 13,
  },
  scoreTextDetail: {
    fontSize: 14,
  },
  scoreTextXl: {
    fontSize: 16,
  },
});
