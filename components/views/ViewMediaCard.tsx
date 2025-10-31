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
import ViewMediaCardMenu from "./ViewMediaCardMenu";

type ViewMediaCardProps = {
  data: APIMedia;
  onDelete?: (id: string) => void;
};

export default function ViewMediaCard({
  data,
  onDelete,
}: ViewMediaCardProps) {
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
      <View style={styles.content}>
        {/* Poster */}
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
            style={styles.posterTouchable}
          >
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
          </TouchableOpacity>
        </Link>

        {/* Content in the middle */}
        <Link
          href={{
            pathname: "/details/[id]",
            params: { type: data.media_type, id: data.tmdb_id.toString() },
          }}
          asChild
          push
          style={styles.textTouchable}
        >
          <TouchableOpacity activeOpacity={BUTTON.opacity}>
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { color: PlatformColor("label") }]}
                numberOfLines={2}
              >
                {data.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: PlatformColor("secondaryLabel") },
                ]}
                numberOfLines={1}
              >
                {getMetadata()}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        {/* Menu on the right */}
        <ViewMediaCardMenu viewId={data.id} onDelete={onDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    position: "relative",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: TOKENS.margin.horizontal,
    paddingRight: 8,
  },
  posterTouchable: {
    marginLeft: 0,
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
  textTouchable: {
    flex: 1,
    marginLeft: 14,
  },
  textContainer: {
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
});
