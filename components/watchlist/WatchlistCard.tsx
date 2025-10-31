import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  PlatformColor,
  // Alert,
} from "react-native";
// import { useRef, useState } from "react";
// import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
// import Reanimated, {
//   SharedValue,
//   useAnimatedStyle,
// } from "react-native-reanimated";
import { Link } from "expo-router";
import { TOKENS, FONTS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { Ionicons } from "@expo/vector-icons";
// import { apiFetch } from "@/services/instances";
// import { notifyError } from "@/components/toasts/Toast";

type WatchlistCardProps = {
  data: Watchlist;
  onUpdate: () => void;
};

export default function WatchlistCard({ data, onUpdate }: WatchlistCardProps) {
  // const swipeRef = useRef<Swipeable>(null);
  // const [isDeleting, setIsDeleting] = useState(false);

  // const renderLeftAction = (
  //   _prog: SharedValue<number>,
  //   drag: SharedValue<number>,
  // ) => {
  //   const styleAnimation = useAnimatedStyle(() => {
  //     return {
  //       transform: [{ translateX: drag.value }],
  //     };
  //   });

  //   return (
  //     <Reanimated.View style={[styles.leftAction, styleAnimation]}>
  //       <Ionicons name="pencil" size={20} color="#fff" />
  //     </Reanimated.View>
  //   );
  // };

  // const renderRightAction = (
  //   _prog: SharedValue<number>,
  //   drag: SharedValue<number>,
  // ) => {
  //   const styleAnimation = useAnimatedStyle(() => {
  //     return {
  //       transform: [{ translateX: drag.value }],
  //     };
  //   });

  //   return (
  //     <Reanimated.View style={[styles.rightAction, styleAnimation]}>
  //       <Ionicons name="trash" size={20} color="#fff" />
  //     </Reanimated.View>
  //   );
  // };

  // const handleSwipeableOpen = (direction: "left" | "right") => {
  //   if (direction === "left") {
  //     // Edit - open modal
  //     router.push({
  //       pathname: "/(modal)/watchlist-edit",
  //       params: { id: data.id },
  //     });
  //     swipeRef.current?.close();
  //   } else if (direction === "right") {
  //     // Delete - show confirmation
  //     openDelete();
  //   }
  // };

  // const openDelete = () => {
  //   Alert.alert(
  //     i18n.t("form.watchlist.delete.title"),
  //     i18n.t("form.watchlist.delete.warning"),
  //     [
  //       {
  //         text: i18n.t("form.watchlist.delete.submit"),
  //         onPress: () => deleteWatchlist(),
  //         style: "destructive",
  //       },
  //       {
  //         text: i18n.t("form.watchlist.delete.cancel"),
  //         style: "cancel",
  //         onPress: () => swipeRef.current?.close(),
  //       },
  //     ],
  //   );
  // };

  // const deleteWatchlist = async () => {
  //   try {
  //     setIsDeleting(true);
  //     await apiFetch(`/api/v1/watchlists/${data.id}`, {
  //       method: "DELETE",
  //     });
  //     onUpdate();
  //   } catch (err: any) {
  //     console.error("Error deleting watchlist:", err);
  //     if (!err.message?.includes("403")) {
  //       notifyError(i18n.t("toast.error"));
  //     }
  //   } finally {
  //     setIsDeleting(false);
  //     swipeRef.current?.close();
  //   }
  // };

  return (
    <Link
      href={{
        pathname: "/watchlist/[id]",
        params: { id: data.id },
      }}
      asChild
    >
      <TouchableOpacity
        activeOpacity={BUTTON.opacity}
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: PlatformColor("label") }]}
              numberOfLines={1}
            >
              {data.title}
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
          <Ionicons
            name="chevron-forward"
            size={18}
            color={PlatformColor("tertiaryLabel") as any}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: TOKENS.margin.horizontal,
    marginBottom: 12,
    borderRadius: TOKENS.radius.md,
    overflow: "hidden",
  },
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
