import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME_COLORS } from "@/constants/theme/colors";

type RatingBadgeProps = {
  score: number;
  size?: "sm" | "md" | "xl";
};

export default function RatingBadge({ score, size = "xl" }: RatingBadgeProps) {
  // Convert TMDB score (0-10) to 0-5 scale
  const displayScore = (score / 2).toFixed(1);

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
    <View style={[styles.container, sizeStyles.container]}>
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  scoreTextXl: {
    fontSize: 16,
  },
});
