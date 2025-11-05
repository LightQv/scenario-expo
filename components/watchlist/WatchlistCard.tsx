import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  PlatformColor,
} from "react-native";
import { Link } from "expo-router";
import { TOKENS, FONTS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";

type WatchlistCardProps = {
  data: Watchlist;
};

export default function WatchlistCard({ data }: WatchlistCardProps) {
  // Translate system watchlist title
  const displayTitle =
    data.title === "toWatch"
      ? i18n.t("screen.watchlist.system.title")
      : data.title;

  const isSystemWatchlist = data.type === "SYSTEM";

  return (
    <Link
      href={{
        pathname: "/watchlist/[id]",
        params: { id: data.id },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={BUTTON.opacity}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: PlatformColor("label") }]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            <Text
              style={[styles.count, { color: PlatformColor("secondaryLabel") }]}
            >
              {data.medias_count}{" "}
              {data.medias_count > 1
                ? i18n.t("screen.watchlist.count.plurial")
                : i18n.t("screen.watchlist.count.singular")}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            {isSystemWatchlist && (
              <Ionicons
                name="lock-closed"
                size={14}
                color={PlatformColor("tertiaryLabel") as any}
              />
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={PlatformColor("tertiaryLabel") as any}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 64,
  },
  textContainer: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  count: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
  },
  // leftAction: {
  //   backgroundColor: "#3B82F6",
  //   justifyContent: "center",
  //   alignItems: "flex-start",
  //   paddingLeft: 24,
  //   marginLeft: TOKENS.margin.horizontal,
  //   marginBottom: 12,
  //   borderRadius: TOKENS.radius.md,
  // },
  // rightAction: {
  //   backgroundColor: "#EF4444",
  //   justifyContent: "center",
  //   alignItems: "flex-end",
  //   paddingRight: 24,
  //   marginRight: -TOKENS.margin.horizontal * 2,
  //   marginBottom: 12,
  //   borderRadius: TOKENS.radius.md,
  // },
});
