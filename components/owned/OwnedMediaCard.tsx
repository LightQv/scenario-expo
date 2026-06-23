import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PlatformColor,
  ColorValue,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TOKENS, FONTS, BLURHASH, BUTTON } from "@/constants/theme";
import { formatFullDate, formatRuntime } from "@/services/utils";
import { useThemeContext, useViewContext } from "@/contexts";
import i18n from "@/services/i18n";

type OwnedMediaCardProps = {
  data: OwnedMedia;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function OwnedMediaCard({
  data,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: OwnedMediaCardProps) {
  const { colors } = useThemeContext();
  const { isViewed } = useViewContext();
  const viewed = isViewed(data.tmdb_id, data.media_type);

  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    return formatFullDate(data.release_date);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || PlatformColor("systemBackground") },
      ]}
    >
      {viewed && (
        <View style={styles.viewedIndicator}>
          <Ionicons name="eye" size={11} color={colors.text} />
        </View>
      )}

      <View style={styles.content}>
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
                source={{ uri: `https://image.tmdb.org/t/p/w342/${data.poster_path}` }}
                alt={data.title}
                style={styles.poster}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            </View>
          </TouchableOpacity>
        </Link>

        <Link
          href={{
            pathname: "/details/[id]",
            params: { type: data.media_type, id: data.tmdb_id.toString() },
          }}
          asChild
          push
        >
          <TouchableOpacity activeOpacity={BUTTON.opacity} style={styles.textTouchable}>
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { color: textColor || PlatformColor("label") }]}
                numberOfLines={2}
              >
                {data.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                ]}
                numberOfLines={1}
              >
                {getMetadata()}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>
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
  viewedIndicator: {
    position: "absolute",
    left: 2,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  textTouchable: {
    flex: 1,
    marginLeft: 14,
    marginRight: 4,
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
