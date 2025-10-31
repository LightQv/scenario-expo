import { StyleSheet, View, Text, PlatformColor } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import i18n from "@/services/i18n";

export default function ViewTypeScreen() {
  const { viewType } = useLocalSearchParams<{ viewType: string }>();

  const getTitle = () => {
    if (viewType === "movie") {
      return i18n.t("screen.profile.views.header.movie");
    } else if (viewType === "tv") {
      return i18n.t("screen.profile.views.header.tv");
    }
    return "Views";
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: getTitle(),
        }}
      />
      <View
        style={[
          styles.container,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
      >
        <Text style={[styles.text, { color: PlatformColor("label") }]}>
          {viewType === "movie" ? "Movies" : "TV Shows"} views content will be
          implemented here
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
  },
});
