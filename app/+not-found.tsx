import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import i18n from "@/services/i18n";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: i18n.t("screen.notFound.title") }} />
      <View style={styles.container}>
        <Text style={styles.title}>{i18n.t("screen.notFound.description")}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{i18n.t("screen.notFound.home")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
