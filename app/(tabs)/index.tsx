import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect } from "react";
import i18n from "@/services/i18n";

export default function TabOneScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: i18n.t("screen.home.header"),
      headerRight: () => (
        <Button title="+" onPress={() => alert(i18n.t("screen.home.add"))} />
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.separator} />
      <Text style={styles.title}>{i18n.t("screen.home.title")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
