import { StyleSheet, View, Text, PlatformColor } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME_COLORS } from "@/constants/theme/colors";

type RatingBadgeProps = {
  score: number;
  size?: "sm" | "default";
};

export default function RatingBadge({
  score,
  size = "default",
}: RatingBadgeProps) {
  // Convert TMDB score (0-10) to 0-5 scale
  const displayScore = (score / 2).toFixed(1);

  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.container,
        isSmall ? styles.containerSmall : styles.containerDefault,
      ]}
    >
      <Ionicons
        name="star"
        size={isSmall ? 11 : 18}
        color={THEME_COLORS.main}
      />
      <Text
        style={[
          styles.scoreText,
          { color: "#fff" },
          isSmall ? styles.scoreTextSmall : styles.scoreTextDefault,
        ]}
      >
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
  containerDefault: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerSmall: {
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scoreText: {
    fontWeight: "600",
  },
  scoreTextDefault: {
    fontSize: 16,
  },
  scoreTextSmall: {
    fontSize: 11,
  },
});
