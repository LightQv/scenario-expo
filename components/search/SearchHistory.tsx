import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  PlatformColor,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import { THEME_COLORS } from "@/constants/theme/colors";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";
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
  const { colors } = useThemeContext();
  const getTypeLabel = (type: "movie" | "tv" | "person") => {
    return i18n.t(`screen.search.type.${type}`);
  };

  const renderHistoryItem = ({ item }: { item: SearchHistoryItem }) => (
    <View>
      <TouchableOpacity
        style={[
          styles.historyItem,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
        onPress={() => onItemPress(item)}
        activeOpacity={BUTTON.opacity}
      >
        <View style={styles.textContainer}>
          <Text
            style={[styles.historyText, { color: PlatformColor("label") }]}
            numberOfLines={1}
          >
            {item.query}
          </Text>
          <Text
            style={[
              styles.typeLabel,
              { color: PlatformColor("secondaryLabel") },
            ]}
            numberOfLines={1}
          >
            {getTypeLabel(item.type)}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={PlatformColor("secondaryLabel")}
        />
      </TouchableOpacity>
      <View
        style={[
          styles.separator,
          { backgroundColor: PlatformColor("separator") },
        ]}
      />
    </View>
  );

  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.text },
          ]}
        >
          {i18n.t("screen.search.history.title")}
        </Text>
        <TouchableOpacity onPress={onClearHistory} activeOpacity={BUTTON.opacity}>
          <Text style={[styles.clearButton, { color: THEME_COLORS.main }]}>
            {i18n.t("screen.search.history.clear")}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.headerSeparator,
          { backgroundColor: PlatformColor("separator") },
        ]}
      />
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
    paddingTop: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: TOKENS.font.xxxl,
    fontFamily: FONTS.bold,
  },
  clearButton: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.lg,
  },
  headerSeparator: {
    height: 0.5,
    marginHorizontal: TOKENS.margin.horizontal,
  },
  listContent: {
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  historyText: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.regular,
  },
  typeLabel: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
  },
  separator: {
    height: 0.5,
  },
});
