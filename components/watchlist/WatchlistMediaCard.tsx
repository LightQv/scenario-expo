import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { TOKENS, FONTS, BLURHASH, BUTTON } from "@/constants/theme";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";
import Animated, { FadeIn, Layout } from "react-native-reanimated";

type WatchlistMediaCardProps = {
  data: APIMedia;
};

export default function WatchlistMediaCard({ data }: WatchlistMediaCardProps) {
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
            {/* Poster on the left */}
            <View style={styles.posterContainer}>
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w342/${data.poster_path}`,
                }}
                alt={data.title}
                style={styles.poster}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            </View>

            {/* Content in the middle */}
            <View style={styles.textContainer}>
              <Animated.Text
                layout={Layout}
                entering={FadeIn.duration(300)}
                style={[styles.title, { color: PlatformColor("label") }]}
                numberOfLines={2}
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

            {/* Action space on the right (placeholder for future button) */}
            <View style={styles.actionSpace} />
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingVertical: 8,
  },
  touchable: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  posterContainer: {
    width: 70,
    height: 105,
    borderRadius: TOKENS.radius.sm,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  title: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  actionSpace: {
    width: 40,
    // Reserved for future action button
  },
});
