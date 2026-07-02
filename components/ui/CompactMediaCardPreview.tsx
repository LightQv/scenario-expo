import type { ReactNode } from "react";
import {
  ColorValue,
  Dimensions,
  PlatformColor,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { BLURHASH, FONTS, TOKENS } from "@/constants/theme";

const PREVIEW_WIDTH =
  Dimensions.get("window").width - TOKENS.margin.horizontal * 2;

type CompactMediaCardPreviewProps = {
  title: string;
  subtitle: string;
  posterPath?: string | null;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
  leadingAccessory?: ReactNode;
  trailingAccessory?: ReactNode;
};

export default function CompactMediaCardPreview({
  title,
  subtitle,
  posterPath,
  backgroundColor,
  textColor,
  secondaryTextColor,
  leadingAccessory,
  trailingAccessory,
}: CompactMediaCardPreviewProps) {
  return (
    <View style={styles.previewOuter}>
      <View
        style={[
          styles.previewCard,
          {
            backgroundColor:
              backgroundColor || PlatformColor("systemBackground"),
          },
        ]}
      >
        {leadingAccessory}

        <View style={styles.previewPosterContainer}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w342/${posterPath}` }}
            alt={title}
            style={styles.poster}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
        </View>

        <View style={styles.previewTextContainer}>
          <Text
            style={[
              styles.title,
              { color: textColor || PlatformColor("label") },
            ]}
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

        {trailingAccessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewOuter: {
    width: PREVIEW_WIDTH,
  },
  previewCard: {
    minHeight: 129,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "relative",
  },
  previewPosterContainer: {
    width: 70,
    height: 105,
    flexShrink: 0,
    borderRadius: TOKENS.radius.lg,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  previewTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 14,
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
