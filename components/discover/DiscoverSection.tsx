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

type DiscoverSectionProps = {
  title: string;
  data: TmdbData[];
  mediaType: string;
  queryPath: string; // Pour la navigation vers la page complète
  loading?: boolean;
};

export default function DiscoverSection({
  title,
  data,
  mediaType,
  queryPath,
  loading = false,
}: DiscoverSectionProps) {
  const renderItem: ListRenderItem<TmdbData> = ({ item }) => (
    <MediaCard data={item} mediaType={mediaType} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
      >
        Aucun résultat
      </Text>
    </View>
  );

  return (
    <>
      <View style={styles.header}>
        <Link
          href={{
            pathname: "discover/[category]",
            params: { category: queryPath, mediaType },
          }}
          asChild
        >
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={[styles.title, { color: PlatformColor("label") }]}>
              {title}
            </Text>
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
