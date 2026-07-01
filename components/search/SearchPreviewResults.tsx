import {
  ActivityIndicator,
  Animated,
  PlatformColor,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { BLURHASH, BUTTON, FONTS, TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import { prefetchDetailPaletteFromImage } from "@/services/detailPalette";
import i18n from "@/services/i18n";
import { formatYear } from "@/services/utils";

const TMDB_ORIGINAL_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

type MediaType = "movie" | "tv" | "person";

type SearchPreviewResultsProps = {
  results: TmdbData[];
  mediaType: MediaType;
  loading: boolean;
  query: string;
  onShowAll: () => void;
  onNavigateAway?: () => void;
  scrollY?: Animated.Value;
};

export default function SearchPreviewResults({
  results,
  mediaType,
  loading,
  query,
  onShowAll,
  onNavigateAway,
  scrollY,
}: SearchPreviewResultsProps) {
  const { isDark } = useThemeContext();
  const handlePress = (item: TmdbData) => {
    const type = item.media_type || mediaType;
    onNavigateAway?.();

    requestAnimationFrame(() => {
      router.push({
        pathname: "/details/[id]",
        params: { id: item.id.toString(), type },
      });
    });
  };

  const prefetchDetails = (item: TmdbData) => {
    const type = item.media_type || mediaType;
    const imagePath =
      type === "person"
        ? item.profile_path || item.backdrop_path || item.poster_path
        : item.backdrop_path || item.poster_path || item.profile_path;

    router.prefetch({
      pathname: "/details/[id]",
      params: { id: item.id.toString(), type },
    });
    prefetchDetailPaletteFromImage(
      imagePath ? `${TMDB_ORIGINAL_IMAGE_BASE_URL}/${imagePath}` : undefined,
      isDark,
    );
  };

  const renderItem = ({ item }: { item: TmdbData }) => {
    const type = item.media_type || mediaType;
    const title = item.title || item.name || "";
    const imagePath = type === "person" ? item.profile_path : item.poster_path;
    const year = formatYear(item.release_date || item.first_air_date || "");
    const meta =
      type === "person"
        ? item.known_for_department || i18n.t("screen.search.label.person")
        : year || i18n.t(`screen.search.label.${type}`);

    return (
      <View>
        <TouchableOpacity
          activeOpacity={BUTTON.opacity}
          onPressIn={() => prefetchDetails(item)}
          onPress={() => handlePress(item)}
          style={styles.row}
        >
          <View style={styles.thumbnailContainer}>
            {imagePath ? (
              <Image
                source={{ uri: `https://image.tmdb.org/t/p/w185${imagePath}` }}
                style={styles.thumbnail}
                contentFit="cover"
                placeholder={BLURHASH.hash}
                transition={BLURHASH.transition}
              />
            ) : (
              <View
                style={[
                  styles.thumbnail,
                  styles.thumbnailFallback,
                  { backgroundColor: PlatformColor("systemGray5") },
                ]}
              >
                <Ionicons
                  name={type === "person" ? "person" : "film"}
                  size={20}
                  color={PlatformColor("secondaryLabel")}
                />
              </View>
            )}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, { color: PlatformColor("label") }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={[styles.meta, { color: PlatformColor("secondaryLabel") }]}
              numberOfLines={1}
            >
              {meta}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={PlatformColor("secondaryLabel")}
          />
        </TouchableOpacity>
        <View style={[styles.separator, { backgroundColor: PlatformColor("separator") }]} />
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={PlatformColor("label")} />
        </View>
      );
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <TouchableOpacity
        activeOpacity={BUTTON.opacity}
        onPress={onShowAll}
        style={styles.showAllButton}
      >
        <Text
          style={[styles.showAllText, { color: PlatformColor("label") }]}
        >
          {i18n.t("screen.search.showAllResults")}
        </Text>
        <Ionicons
          name="arrow-forward-circle"
          size={22}
          color={PlatformColor("label")}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.id}-${item.media_type || mediaType}`}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      onScroll={
        scrollY
          ? Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )
          : undefined
      }
      scrollEventThrottle={16}
      ListHeaderComponent={
        <Text
          style={[
            styles.previewTitle,
            { color: PlatformColor("secondaryLabel") },
          ]}
        >
          {query}
        </Text>
      }
      ListFooterComponent={renderFooter}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 86,
  },
  previewTitle: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.sm,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  thumbnailContainer: {
    width: 44,
    height: 60,
    borderRadius: TOKENS.radius.sm,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PlatformColor("separator"),
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.xxl,
  },
  meta: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  loadingContainer: {
    paddingVertical: 24,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  showAllText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
});
