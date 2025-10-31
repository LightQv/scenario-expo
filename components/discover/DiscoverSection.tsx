import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  PlatformColor,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { FONTS, TOKENS } from "@/constants/theme";
import MediaCard from "@/components/discover/MediaCard";
import PersonCard from "@/components/discover/PersonCard";
import i18n from "@/services/i18n";

type DiscoverSectionProps = {
  title: string;
  data: TmdbData[];
  mediaType: string;
  queryPath: string; // For navigation to the full page
  loading?: boolean;
  cardSize?: "sm" | "md" | "xl";
};

export default function DiscoverSection({
  title,
  data,
  mediaType,
  queryPath,
  loading = false,
  cardSize = "sm",
}: DiscoverSectionProps) {
  const renderItem: ListRenderItem<TmdbData> = ({ item }) => {
    // Render PersonCard for person mediaType, otherwise MediaCard
    if (mediaType === "person") {
      return <PersonCard data={item} />;
    }
    return <MediaCard data={item} mediaType={mediaType} size={cardSize} />;
  };

  const renderSeparator = () => {
    const gap = cardSize === "md" ? 21 : 14; // 14 * 1.5 for md
    return <View style={{ width: gap }} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
      >
        {i18n.t("toast.errorQuery")}
      </Text>
    </View>
  );

  return (
    <>
      <View style={styles.header}>
        <Link
          href={{
            pathname: "/(tabs)/discover/[category]",
            params: { category: queryPath, mediaType, title },
          }}
          asChild
        >
          <TouchableOpacity activeOpacity={0.6} style={styles.titleContainer}>
            <Text style={[styles.title, { color: PlatformColor("label") }]}>
              {title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={PlatformColor("secondaryLabel")}
            />
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
  },
  listContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 24,
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
