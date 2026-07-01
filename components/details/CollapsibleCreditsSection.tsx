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
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import HorizontalMediaCard from "./HorizontalMediaCard";
import { Ionicons } from "@expo/vector-icons";
import i18n from "@/services/i18n";

type CollapsibleCreditsSectionProps = {
  title: string;
  credits: (PersonMovieCredit | PersonTvCredit)[];
  mediaType: "movie" | "tv";
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function CollapsibleCreditsSection({
  title,
  credits,
  mediaType,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: CollapsibleCreditsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderItem: ListRenderItem<PersonMovieCredit | PersonTvCredit> = ({
    item,
  }) => {
    return (
      <HorizontalMediaCard
        data={item}
        mediaType={mediaType}
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text
        style={[
          styles.emptyText,
          { color: secondaryTextColor || PlatformColor("secondaryLabel") },
        ]}
      >
        {i18n.t("screen.detail.credits.empty")}
      </Text>
    </View>
  );

  if (!credits || credits.length === 0) {
    return null;
  }

  return (
    <View
      style={[styles.sectionContainer, backgroundColor && { backgroundColor }]}
    >
      {/* Header with collapse button */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor || PlatformColor("label") }]}> 
          {title}
        </Text>
        <TouchableOpacity
          onPress={toggleCollapse}
          style={styles.collapseButton}
          activeOpacity={BUTTON.opacity}
        >
          <Ionicons
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={18}
            color={textColor || PlatformColor("label")}
          />
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
    minHeight: 40,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxxl,
    lineHeight: 40,
    flex: 1,
  },
  collapseButton: {
    width: 40,
    height: 40,
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
