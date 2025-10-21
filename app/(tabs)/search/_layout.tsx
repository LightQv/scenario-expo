import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, useColorScheme } from "react-native";

export default function SearchLayout() {
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState("");
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: false,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "transparent" },
          headerTransparent: true,
          headerTitle: "",
          headerSearchBarOptions: {
            placement: "automatic",
            placeholder: "Search",
            onChangeText: (event) => {
              setSearch(event.nativeEvent.text);
            },
            onSearchButtonPress: () => {},
          },
        }}
      />
      <Stack.Screen
        name="[genreId]"
        options={{
          headerLargeTitle: false,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "transparent" },
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={colorScheme === "dark" ? "#fff" : "#000"}
                style={{ marginLeft: 2 }}
              />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
