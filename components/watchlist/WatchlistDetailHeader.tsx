import { StyleSheet, Text, View, useColorScheme } from "react-native";
import { TOKENS, FONTS } from "@/constants/theme";
import i18n from "@/services/i18n";

type WatchlistDetailHeaderProps = {
  title: string;
  mediaCount: number;
};

export default function WatchlistDetailHeader({
  title,
  mediaCount,
}: WatchlistDetailHeaderProps) {
  const colorScheme = useColorScheme();

  // Translate system watchlist title
  const displayTitle =
    title === "toWatch" ? i18n.t("screen.watchlist.system.title") : title;

  const getBackgroundColor = () => {
    return colorScheme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)";
  };

  return (
    <View style={styles.container}>
      {/* Title Section - Centered */}
      <View style={styles.titleSection}>
        <Text style={styles.title} numberOfLines={2}>
          {displayTitle}
        </Text>
        {/* Media Count Pill - Centered */}
        <View style={styles.pillContainer}>
          <View
            style={[
              styles.countPill,
              { backgroundColor: getBackgroundColor() },
            ]}
          >
            <Text style={styles.countText}>
              {mediaCount}{" "}
              {mediaCount > 1
                ? i18n.t("screen.watchlist.count.plurial")
                : i18n.t("screen.watchlist.count.singular")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: TOKENS.margin.vertical * 2,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  titleSection: {
    gap: 12,
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
  pillContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  countPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  countText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
    color: "#fff",
  },
});
