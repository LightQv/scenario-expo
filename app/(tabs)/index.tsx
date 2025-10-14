import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function TabOneScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Accueil",
      headerRight: () => <Button title="+" onPress={() => alert("Ajout")} />,
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.separator} />
      <Text style={styles.title}>Index index</Text>
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
