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
import AppleMusicArtworkWash from "@/components/details/AppleMusicArtworkWash";

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
  const detailPillBackground = colorWithAlpha(palette.surface, 0.68);
  const detailPillBorder = colorWithAlpha(palette.tint, 0.55);
  const imageSource = src
    ? { uri: `https://image.tmdb.org/t/p/original/${src}` }
    : undefined;
  const imageUrl = src ? `https://image.tmdb.org/t/p/original/${src}` : undefined;

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
      <View pointerEvents="none" style={styles.visualStage}>
        <AppleMusicArtworkWash
          imageUrl={imageUrl}
          palette={palette}
          scrollY={scrollY}
          width={width}
          height={BANNER_HEIGHT}
        />

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
            <LinearGradient
              colors={[
                "transparent",
                "transparent",
                colorWithAlpha(palette.tint, 0.08),
                colorWithAlpha(palette.background, 0.18),
              ]}
              locations={[0, 0.46, 0.72, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        </View>

        {/* Bottom-only blurred image fade. The solid background fade is dynamic below. */}
        <View style={styles.gradientContainer}>
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
        </View>
      </View>

      <View pointerEvents="none" style={styles.dynamicFadeContainer}>
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            colorWithAlpha(palette.tint, 0.16),
            colorWithAlpha(palette.tint, 0.34),
            colorWithAlpha(palette.background, 0.64),
            colorWithAlpha(palette.background, 0.86),
            colorWithAlpha(palette.background, 0.97),
            palette.background,
          ]}
          locations={[0, 0.42, 0.52, 0.62, 0.72, 0.82, 0.92, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[
            "transparent",
            "transparent",
            "rgba(0,0,0,0.08)",
            "rgba(0,0,0,0.13)",
            "transparent",
          ]}
          locations={[0, 0.44, 0.6, 0.76, 1]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Content Section */}
      <View
        style={[
          styles.contentSection,
          isPerson ? styles.personContentSection : styles.mediaContentSection,
        ]}
      >
        {/* Title Section - Centered */}
        <View style={[styles.titleSection, isPerson && styles.personTitleSection]}>
          <Text style={[styles.title, { color: palette.text }]} numberOfLines={2}>
            {title}
          </Text>
          {controls}
          {/* Genre Pills and Rating Badge - Centered on same row (or Gender/Age for person) */}
          <View style={[styles.genreContainer, isPerson && styles.personGenreContainer]}>
            {isPerson ? (
              <>
                {/* Gender */}
                {gender !== undefined && (
                  <View
                      style={[
                        styles.genrePill,
                        {
                          backgroundColor: detailPillBackground,
                          borderColor: detailPillBorder,
                        },
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
                        {
                          backgroundColor: detailPillBackground,
                          borderColor: detailPillBorder,
                        },
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
                            {
                              backgroundColor: detailPillBackground,
                              borderColor: detailPillBorder,
                            },
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
                    iconColor={palette.text}
                    backgroundColor={detailPillBackground}
                    borderColor={detailPillBorder}
                  />
                )}
              </>
            )}
          </View>
          <View style={!isPerson && styles.mediaMetadataSlot}>
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
      <View style={[styles.metadataGroup, styles.personMetadataGroup]}>
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
    minHeight: 0,
    position: "relative",
  },
  visualStage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_HEIGHT,
  },
  dynamicFadeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    position: "relative",
    paddingHorizontal: TOKENS.margin.horizontal,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  mediaContentSection: {
    paddingTop: 360,
    paddingBottom: 28,
  },
  personContentSection: {
    paddingTop: 440,
    paddingBottom: 24,
  },
  titleSection: {
    gap: 4,
    alignItems: "center",
    width: "100%",
  },
  personTitleSection: {
    gap: 10,
  },
  title: {
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
    textAlign: "center",
    paddingHorizontal: TOKENS.margin.horizontal / 2,
    fontFamily: FONTS.abril,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
    alignSelf: "center",
    marginBottom: 10,
  },
  personGenreContainer: {
    marginTop: 2,
    marginBottom: 8,
  },
  genrePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  mediaMetadataSlot: {
    width: "100%",
    marginTop: 10,
    alignItems: "center",
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
  personMetadataGroup: {
    gap: 10,
  },
  metadataText: {
    fontSize: TOKENS.font.md,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
  statusText: {
    fontSize: TOKENS.font.sm,
    fontFamily: FONTS.bold,
    textTransform: "uppercase",
  },
});
