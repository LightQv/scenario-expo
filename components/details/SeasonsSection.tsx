import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PlatformColor,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { FONTS, TOKENS, BLURHASH, BUTTON } from "@/constants/theme";
import { formatFullDate } from "@/services/utils";
import i18n from "@/services/i18n";

type SeasonsSectionProps = {
  title: string;
  seasons: Season[];
  seasonAvailability?: TvSeasonAvailability[];
  showAvailabilityBadges?: boolean;
  seriesId: string;
  seriesName: string;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function SeasonsSection({
  title,
  seasons,
  seasonAvailability = [],
  showAvailabilityBadges = false,
  seriesId,
  seriesName,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: SeasonsSectionProps) {
  const renderItem: ListRenderItem<Season> = ({ item }) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w342/${item.poster_path}`
      : null;
    const availability = seasonAvailability.find(
      (season) => season.season_number === item.season_number,
    );
    const shouldShowAvailability =
      showAvailabilityBadges &&
      (item.episode_count || 0) > 0 &&
      (availability?.status === "available" || availability?.status === "partial");

    return (
      <Link
        href={{
          pathname: "/season/[seriesId]/[seasonNumber]",
          params: {
            seriesId,
            seasonNumber: item.season_number.toString(),
            seriesName,
          },
        }}
        asChild
        push
      >
        <TouchableOpacity style={styles.container} activeOpacity={BUTTON.opacity}>
          <View style={styles.imageContainer}>
            {shouldShowAvailability && (
              <View style={styles.availabilityBadge}>
                <Text style={styles.availabilityBadgeText}>
                  {availability?.status === "available"
                    ? i18n.t("screen.detail.media.available")
                    : i18n.t("screen.detail.media.partial")}
                </Text>
              </View>
            )}

            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                alt={item.name}
                style={styles.image}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            ) : (
              <View
                style={[
                  styles.image,
                  styles.placeholderImage,
                  { backgroundColor: PlatformColor("systemGray4") },
                ]}
              >
                <Text
                  style={[
                    styles.placeholderText,
                    { color: PlatformColor("secondaryLabel") },
                  ]}
                >
                  {item.name?.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text
              style={[styles.seasonName, { color: textColor || PlatformColor("label") }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <View style={styles.metaRow}>
              {item.air_date && (
                <Text
                  style={[
                    styles.metaText,
                    { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {formatFullDate(item.air_date)}
                </Text>
              )}
              {item.episode_count !== null && item.episode_count > 0 && (
                <Text
                  style={[
                    styles.metaText,
                    { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {item.episode_count}{" "}
                  {item.episode_count > 1
                    ? i18n.t("screen.detail.media.seasons.episode.plurial")
                    : i18n.t("screen.detail.media.seasons.episode.singular")}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  const renderSeparator = () => <View style={{ width: 14 }} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          { color: secondaryTextColor || PlatformColor("secondaryLabel") },
        ]}
      >
        {i18n.t("screen.detail.media.seasons.empty")}
      </Text>
    </View>
  );

  if (!seasons || seasons.length === 0) {
    return null;
  }

  return (
    <View
      style={[styles.sectionContainer, backgroundColor && { backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor || PlatformColor("label") }]}> 
          {title}
        </Text>
      </View>

      <FlatList
        data={seasons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingBottom: 24,
    backgroundColor: PlatformColor("systemBackground"),
  },
  header: {
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
  },
  listContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  container: {
    width: 180,
  },
  imageContainer: {
    position: "relative",
    width: 180,
    height: 265,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: PlatformColor("systemGray5"),
  },
  image: {
    width: "100%",
    height: "100%",
  },
  availabilityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    borderRadius: TOKENS.radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  availabilityBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xs,
    color: "#fff",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontFamily: FONTS.bold,
    fontSize: 48,
  },
  content: {
    marginTop: 6,
    gap: 2,
  },
  seasonName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "column",
    gap: 2,
  },
  metaText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
});
