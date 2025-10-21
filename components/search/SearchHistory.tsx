import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  PlatformColor,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, TOKENS } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import i18n from "@/services/i18n";
import type { SearchHistoryItem } from "@/services/searchHistory";

type SearchHistoryProps = {
  history: SearchHistoryItem[];
  onItemPress: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
};

export default function SearchHistory({
  history,
  onItemPress,
  onClearHistory,
}: SearchHistoryProps) {
  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <TouchableOpacity
      style={[
        styles.historyItem,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
      onPress={() => onItemPress(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.historyText, { color: PlatformColor("label") }]}
        numberOfLines={1}
      >
        {item.query}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={PlatformColor("secondaryLabel")}
      />
    </TouchableOpacity>
  );

  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: THEME_COLORS.main }]}>
          {i18n.t("screen.search.history.title")}
        </Text>
        <TouchableOpacity onPress={onClearHistory} activeOpacity={0.7}>
          <Text style={[styles.clearButton, { color: THEME_COLORS.main }]}>
            {i18n.t("screen.search.history.clear")}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => `${item.query}-${item.type}-${item.timestamp}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: FONTS.abril,
    fontSize: TOKENS.font.title,
  },
  clearButton: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.lg,
  },
  listContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
    gap: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: TOKENS.radius.md,
  },
  historyText: {
    fontFamily: FONTS.abril,
    fontSize: TOKENS.font.xxl,
    flex: 1,
  },
});
