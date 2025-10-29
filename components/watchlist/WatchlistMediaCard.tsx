import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { TOKENS, FONTS, BLURHASH, BUTTON } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useRef } from "react";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";

type WatchlistMediaCardProps = {
  data: APIMedia;
  onUpdate: () => void;
};

export default function WatchlistMediaCard({
  data,
  onUpdate,
}: WatchlistMediaCardProps) {
  const swipeRef = useRef<Swipeable>(null);

  const renderRightAction = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    const animatedStyle = {
      transform: [{ translateX: dragX }],
    };

    return (
      <Animated.View style={[styles.deleteAction, animatedStyle]}>
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={BUTTON.opacity}
          onPress={openDelete}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const openDelete = () => {
    Alert.alert(
      i18n.t("form.media.delete.title"),
      i18n.t("form.media.delete.warning"),
      [
        {
          text: i18n.t("form.media.delete.submit"),
          onPress: () => deleteMedia(),
          style: "destructive",
        },
        {
          text: i18n.t("form.media.delete.cancel"),
          style: "cancel",
          onPress: () => swipeRef.current?.close(),
        },
      ],
    );
  };

  const deleteMedia = async () => {
    try {
      await apiFetch(`/api/v1/medias/${data.id}`, {
        method: "DELETE",
      });
      onUpdate();
    } catch (err: any) {
      console.error("Error deleting media:", err);
      if (!err.message?.includes("403")) {
        notifyError(i18n.t("toast.error"));
      }
    } finally {
      swipeRef.current?.close();
    }
  };

  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    if (data.media_type === "tv") {
      const episodeLabel =
        data.runtime > 1
          ? i18n.t("screen.detail.media.seasons.episode.plurial")
          : i18n.t("screen.detail.media.seasons.episode.singular");
      return `${formatFullDate(data.release_date)} • ${data.runtime} ${episodeLabel}`;
    }
    return formatFullDate(data.release_date);
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightAction}
      rightThreshold={40}
      friction={2}
      overshootFriction={8}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
      >
        <Link
          href={{
            pathname: "/details/[id]",
            params: { type: data.media_type, id: data.tmdb_id.toString() },
          }}
          asChild
          push
        >
          <TouchableOpacity
            activeOpacity={BUTTON.opacity}
            style={styles.touchable}
          >
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Animated.Text
                  layout={Layout}
                  entering={FadeIn.duration(300)}
                  style={[styles.title, { color: PlatformColor("label") }]}
                  numberOfLines={1}
                >
                  {data.title}
                </Animated.Text>
                <Animated.Text
                  layout={Layout}
                  entering={FadeIn.duration(300)}
                  style={[
                    styles.subtitle,
                    { color: PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {getMetadata()}
                </Animated.Text>
              </View>
              <View style={styles.posterContainer}>
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w200/${data.poster_path}`,
                  }}
                  alt={data.title}
                  style={styles.poster}
                  contentFit="cover"
                  placeholder={BLURHASH.hash}
                  transition={BLURHASH.transition}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: TOKENS.margin.horizontal,
    marginBottom: 12,
    borderRadius: TOKENS.radius.md,
    overflow: "hidden",
  },
  touchable: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  posterContainer: {
    width: 60,
    height: 90,
    borderRadius: TOKENS.radius.sm,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: TOKENS.margin.horizontal,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: THEME_COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: TOKENS.radius.md,
  },
});
