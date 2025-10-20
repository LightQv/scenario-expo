import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PlatformColor,
  ListRenderItem,
} from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";
import CastCard from "@/components/details/CastCard";

type CastSectionProps = {
  title: string;
  cast: Cast[];
};

export default function CastSection({ title, cast }: CastSectionProps) {
  const renderItem: ListRenderItem<Cast> = ({ item }) => (
    <CastCard data={item} />
  );

  const renderSeparator = () => <View style={{ width: 14 }} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
      >
        No cast information
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: PlatformColor("label") }]}>
          {title}
        </Text>
      </View>

      <FlatList
        data={cast.slice(0, 15)} // Limit to first 15 cast members
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
  container: {
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
});
