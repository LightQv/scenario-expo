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
import { formatYear } from "@/services/utils";

type KnownForSectionProps = {
  title: string;
  credits: PersonDatasList;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function KnownForSection({
  title,
  credits,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: KnownForSectionProps) {
  // Sort by vote count and filter popular items
  const creditsByPopularity = credits.cast
    ?.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    ?.filter((el) => (el?.vote_count || 0) >= 500)
    .slice(0, 15);

  const renderItem: ListRenderItem<PersonDataList> = ({ item }) => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w342/${item.poster_path}`
      : null;

    const releaseDate = item.release_date || item.first_air_date;
    const mediaTitle = item.title || item.name;

    return (
      <Link
        href={{
          pathname: "/details/[id]",
          params: { type: item.media_type, id: item.id.toString() },
        }}
        asChild
        push
      >
        <TouchableOpacity style={styles.container} activeOpacity={BUTTON.opacity}>
          <View style={styles.imageContainer}>
            {posterUrl ? (
              <Image
                source={{ uri: posterUrl }}
                alt={mediaTitle}
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
                  {mediaTitle?.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Character name as title */}
            <Text
              style={[styles.characterName, { color: textColor || PlatformColor("label") }]}
              numberOfLines={1}
            >
              {item.character || "—"}
            </Text>

            {/* Media title and year as metadata */}
            <View style={styles.metaRow}>
              {mediaTitle && (
                <Text
                  style={[
                    styles.mediaTitle,
                    { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {mediaTitle}
                </Text>
              )}
              {releaseDate && (
                <Text
                  style={[
                    styles.year,
                    { color: secondaryTextColor || PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {formatYear(releaseDate)}
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
        No credits found
      </Text>
    </View>
  );

  if (!creditsByPopularity || creditsByPopularity.length === 0) {
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
        data={creditsByPopularity}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.media_type}`}
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
    marginBottom: 24,
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
  characterName: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaTitle: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xs,
    flex: 1,
  },
  year: {
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
