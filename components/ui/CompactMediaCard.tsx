import type { ReactNode } from "react";
import {
  ColorValue,
  PlatformColor,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { BLURHASH, BUTTON, FONTS, TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import { prefetchDetailPaletteFromImage } from "@/services/detailPalette";

const TMDB_ORIGINAL_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

type CompactMediaCardProps = {
  title: string;
  subtitle: string;
  mediaType: string;
  tmdbId: number;
  posterPath?: string | null;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
  leadingAccessory?: ReactNode;
  trailingAccessory?: ReactNode;
  textRightMargin?: number;
};

export default function CompactMediaCard({
  title,
  subtitle,
  mediaType,
  tmdbId,
  posterPath,
  backgroundColor,
  textColor,
  secondaryTextColor,
  leadingAccessory,
  trailingAccessory,
  textRightMargin = 4,
}: CompactMediaCardProps) {
  const { isDark } = useThemeContext();
  const detailsHref = {
    pathname: "/details/[id]" as const,
    params: { type: mediaType, id: tmdbId.toString() },
  };
  const prefetchPalette = () => {
    prefetchDetailPaletteFromImage(
      posterPath ? `${TMDB_ORIGINAL_IMAGE_BASE_URL}/${posterPath}` : undefined,
      isDark,
    );
  };
  const textTouchableStyle = StyleSheet.flatten([
    styles.textTouchable,
    { marginRight: textRightMargin },
  ]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || PlatformColor("systemBackground") },
      ]}
    >
      {leadingAccessory}

      <View style={styles.content}>
        <Link href={detailsHref} asChild push prefetch>
          <TouchableOpacity
            activeOpacity={BUTTON.opacity}
            onPressIn={prefetchPalette}
            style={styles.posterTouchable}
          >
            <View style={styles.posterContainer}>
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w342/${posterPath}` }}
                alt={title}
                style={styles.poster}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            </View>
          </TouchableOpacity>
        </Link>

        <Link href={detailsHref} asChild push prefetch>
          <TouchableOpacity
            activeOpacity={BUTTON.opacity}
            onPressIn={prefetchPalette}
            style={textTouchableStyle}
          >
            <View style={styles.textContainer}>
              <Text
                style={[styles.title, { color: textColor || PlatformColor("label") }]}
                numberOfLines={2}
              >
                {title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        {trailingAccessory}
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
