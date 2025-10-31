import {
  StyleSheet,
  Text,
  View,
  PlatformColor,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { FONTS, TOKENS, THEME_COLORS, BUTTON } from "@/constants/theme";
import HorizontalMediaCard from "./HorizontalMediaCard";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";

type CollapsibleCreditsSectionProps = {
  title: string;
  credits: (PersonMovieCredit | PersonTvCredit)[];
  mediaType: "movie" | "tv";
};

export default function CollapsibleCreditsSection({
  title,
  credits,
  mediaType,
}: CollapsibleCreditsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const rotation = useSharedValue(0);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    rotation.value = withTiming(isCollapsed ? 0 : -90, { duration: 200 });
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const renderItem: ListRenderItem<PersonMovieCredit | PersonTvCredit> = ({
    item,
  }) => {
    return <HorizontalMediaCard data={item} mediaType={mediaType} />;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[styles.emptyText, { color: PlatformColor("secondaryLabel") }]}
      >
        No credits found
      </Text>
    </View>
  );

  if (!credits || credits.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      {/* Header with collapse button */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: PlatformColor("label") }]}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={toggleCollapse}
          style={[
            styles.collapseButton,
            { backgroundColor: PlatformColor("systemGray5") },
          ]}
          activeOpacity={BUTTON.opacity}
        >
          <Animated.View style={animatedIconStyle}>
            <Ionicons name="chevron-down" size={16} color={THEME_COLORS.main} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Collapsible content */}
      {!isCollapsed && (
        <FlatList
          data={credits}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          scrollEnabled={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingBottom: 12,
    backgroundColor: PlatformColor("systemBackground"),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: TOKENS.margin.horizontal,
    marginBottom: 12,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
    flex: 1,
  },
  collapseButton: {
    width: 24,
    height: 24,
    borderRadius: TOKENS.radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: TOKENS.margin.horizontal,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
});
