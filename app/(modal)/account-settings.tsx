import { StyleSheet, View, Text, PlatformColor, ScrollView } from "react-native";
import { TOKENS, FONTS } from "@/constants/theme";

export default function AccountSettingsScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <Text style={[styles.text, { color: PlatformColor("label") }]}>
          Account settings content will be implemented here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  scrollContent: {
    padding: TOKENS.margin.horizontal,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
});
