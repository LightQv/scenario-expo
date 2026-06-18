import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import { Image } from "expo-image";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { BLURHASH, TOKENS, FONTS, BUTTON } from "@/constants/theme";
import RatingBadge from "@/components/ui/RatingBadge";
import {
  calculateAge,
  formatFullDate,
  formatGender,
  formatRuntime,
} from "@/services/utils";
import i18n from "@/services/i18n";
import { colorWithAlpha, type DetailPalette } from "@/services/detailPalette";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 600;

type BannerProps = {
  src: string | undefined;
  alt?: string;
  score?: number;
  title: string;
  genres?: Genre[];
  scrollY: SharedValue<number>;
  /* Person-specific props */
  gender?: number;
  birthday?: string | null;
  deathday?: string | null;
  knownForDepartment?: string;
  releaseDate?: string;
  runtime?: number;
  status?: string;
  firstAirDate?: string;
  lastAirDate?: string | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  placeOfBirth?: string | null;
  palette: DetailPalette;
  controls?: ReactNode;
};

export default function Banner({
  src,
  alt,
  score,
  title,
  genres,
  scrollY,
  gender,
  birthday,
  deathday,
  knownForDepartment,
  releaseDate,
  runtime,
  status,
  firstAirDate,
  lastAirDate,
  numberOfSeasons,
  numberOfEpisodes,
  placeOfBirth,
  palette,
  controls,
}: BannerProps) {
  const { type } = useLocalSearchParams<{ type: string }>();

  const isPerson = type === "person";
  const age = birthday ? calculateAge(birthday, deathday) : null;
  const imageSource = src
    ? { uri: `https://image.tmdb.org/t/p/original/${src}` }
    : undefined;

  // Parallax animation for the banner image (same formula as previous version)
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
            [-BANNER_HEIGHT / 2, 0, BANNER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.imageWrapper}>
        <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
          <Image
            source={imageSource}
            alt={alt}
            style={styles.image}
            contentFit="cover"
            placeholder={BLURHASH.hash}
            transition={BLURHASH.transition}
          />
        </Animated.View>
      </View>

      {/* Bottom-only blurred fade from the image into the adaptive page background. */}
      <View pointerEvents="none" style={styles.gradientContainer}>
        <MaskedView
          style={StyleSheet.absoluteFill}
          maskElement={
            <LinearGradient
              colors={[
                "rgba(0,0,0,0)",
                "rgba(0,0,0,0)",
                "rgba(0,0,0,0.06)",
                "rgba(0,0,0,0.3)",
                "rgba(0,0,0,0.66)",
                "rgba(0,0,0,1)",
              ]}
              locations={[0, 0.38, 0.54, 0.72, 0.92, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          }
        >
          <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
            <Image
              source={imageSource}
              alt={alt}
              style={styles.image}
              contentFit="cover"
              blurRadius={340}
            />
          </Animated.View>
        </MaskedView>
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            colorWithAlpha(palette.background, 0.22),
            colorWithAlpha(palette.background, 0.54),
            colorWithAlpha(palette.background, 0.82),
            colorWithAlpha(palette.background, 0.96),
            palette.background,
          ]}
          locations={[0, 0.44, 0.58, 0.7, 0.82, 0.92, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            "rgba(0,0,0,0.1)",
            "rgba(0,0,0,0.16)",
            "transparent",
          ]}
          locations={[0, 0.44, 0.62, 0.78, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Content Section */}
      <View
        style={[
          styles.contentSection,
          { paddingBottom: 16 },
        ]}
      >
        {/* Title Section - Centered */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
            {title}
          </Text>
          {controls}
          {/* Genre Pills and Rating Badge - Centered on same row (or Gender/Age for person) */}
          <View style={styles.genreContainer}>
            {isPerson ? (
              <>
                {/* Gender */}
                {gender !== undefined && (
                  <View
                    style={[
                      styles.genrePill,
                      { backgroundColor: palette.pillBackground },
                    ]}
                  >
                    <Text style={[styles.genreText, { color: palette.text }]}>
                      {formatGender(gender)}
                    </Text>
                  </View>
                )}
                {/* Age */}
                {age !== null && (
                  <View
                    style={[
                      styles.genrePill,
                      { backgroundColor: palette.pillBackground },
                    ]}
                  >
                    <Text style={[styles.genreText, { color: palette.text }]}>
                      {age} {i18n.t("screen.person.age")}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Genre Pills - Show only first 2 */}
                {genres &&
                  genres.length > 0 &&
                  genres.slice(0, 2).map((genre) => (
                    <Link
                      href={{
                        pathname: "/discover",
                        params: { type, genreId: genre.id },
                      }}
                      key={genre.id}
                      asChild
                    >
                      <TouchableOpacity activeOpacity={BUTTON.opacity}>
                        <View
                          style={[
                            styles.genrePill,
                            { backgroundColor: palette.pillBackground },
                          ]}
                        >
                          <Text style={[styles.genreText, { color: palette.text }]}>
                            {genre.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Link>
                  ))}
                {/* Rating Badge */}
                {typeof score === "number" && score > 0 && (
                  <RatingBadge
                    score={score}
                    size="detail"
                    textColor={palette.text}
                  />
                )}
              </>
            )}
          </View>
          {renderMetadata({
            type,
            releaseDate,
            runtime,
            status,
            firstAirDate,
            lastAirDate,
            numberOfSeasons,
            numberOfEpisodes,
            birthday,
            placeOfBirth,
            knownForDepartment,
            textColor: palette.text,
            secondaryTextColor: palette.text,
          })}
        </View>
      </View>
    </View>
  );
}

function renderMetadata({
  type,
  releaseDate,
  runtime,
  status,
  firstAirDate,
  lastAirDate,
  numberOfSeasons,
  numberOfEpisodes,
  birthday,
  placeOfBirth,
  knownForDepartment,
  textColor,
  secondaryTextColor,
}: {
  type?: string;
  releaseDate?: string;
  runtime?: number;
  status?: string;
  firstAirDate?: string;
  lastAirDate?: string | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  birthday?: string | null;
  placeOfBirth?: string | null;
  knownForDepartment?: string;
  textColor: string;
  secondaryTextColor: string;
}) {
  if (type === "movie" && releaseDate) {
    return (
      <Text style={[styles.metadataText, { color: secondaryTextColor }]}>
        {formatFullDate(releaseDate)}
        {runtime && ` • ${formatRuntime(runtime)}`}
      </Text>
    );
  }

  if (type === "tv") {
    return (
      <View style={styles.metadataGroup}>
        {status && (
          <Text style={[styles.statusText, { color: textColor }]}>{status}</Text>
        )}
        <Text style={[styles.metadataText, { color: secondaryTextColor }]}>
          {firstAirDate && formatFullDate(firstAirDate)}
          {lastAirDate && ` - ${formatFullDate(lastAirDate)}`}
        </Text>
        {(numberOfSeasons || numberOfEpisodes) && (
          <Text style={[styles.metadataText, { color: secondaryTextColor }]}>
            {numberOfSeasons &&
              `${numberOfSeasons} ${
                numberOfSeasons > 1
                  ? i18n.t("screen.detail.media.seasons.season.plurial")
                  : i18n.t("screen.detail.media.seasons.season.singular")
              }`}
            {numberOfSeasons && numberOfEpisodes && " • "}
            {numberOfEpisodes &&
              `${numberOfEpisodes} ${
                numberOfEpisodes > 1
                  ? i18n.t("screen.detail.media.seasons.episode.plurial")
                  : i18n.t("screen.detail.media.seasons.episode.singular")
              }`}
          </Text>
        )}
      </View>
    );
  }

  if (type === "person") {
    return (
      <View style={styles.metadataGroup}>
        {knownForDepartment && (
          <Text style={[styles.statusText, { color: textColor }]}>
            {knownForDepartment}
          </Text>
        )}
        <Text style={[styles.metadataText, { color: secondaryTextColor }]}>
          {birthday && formatFullDate(birthday)}
          {birthday && placeOfBirth && " • "}
          {placeOfBirth}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    width,
    height: BANNER_HEIGHT,
    position: "relative",
  },
  imageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradientContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  contentSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: TOKENS.margin.horizontal,
    gap: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  titleSection: {
    gap: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
    textAlign: "center",
    paddingHorizontal: TOKENS.margin.horizontal / 2,
    fontFamily: FONTS.abril,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 16,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 4,
  },
  genrePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  genreText: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    letterSpacing: 0.2,
  },
  metadataGroup: {
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  statusText: {
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
