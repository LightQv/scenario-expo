import { Ionicons } from "@expo/vector-icons";
import { PlatformColor, StyleSheet, Text, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";
import SettingsIcon from "@/components/settings/SettingsIcon";

type SettingsDescriptionCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColors?: [string, string];
};

export default function SettingsDescriptionCard({
  title,
  description,
  icon,
  iconColors,
}: SettingsDescriptionCardProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("secondarySystemGroupedBackground") },
      ]}
    >
      <SettingsIcon name={icon} colors={iconColors} size="lg" />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: PlatformColor("label") }]}>
          {title}
        </Text>
        <Text
          style={[styles.description, { color: PlatformColor("secondaryLabel") }]}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    padding: 22,
    gap: 16,
  },
  textContainer: {
    gap: 5,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 28,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xl,
    lineHeight: 20,
  },
});
