import { StyleSheet, View, TouchableOpacity, Text, PlatformColor } from "react-native";
import { GlassView } from "expo-glass-effect";
import { FONTS, TOKENS } from "@/constants/theme";

interface TabSelectorProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabSelector({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  return (
    <View style={styles.container}>
      <GlassView style={styles.glassView} tint="light">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  glassView: {
    flexDirection: "row",
    borderRadius: TOKENS.radius.sm,
    padding: 4,
    marginHorizontal: TOKENS.margin.horizontal,
    marginTop: TOKENS.margin.horizontal,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: TOKENS.margin.horizontal,
    borderRadius: TOKENS.radius.sm - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
    color: "rgba(0, 0, 0, 0.6)",
  },
  activeTabText: {
    fontFamily: FONTS.bold,
    color: PlatformColor("label"),
  },
});
