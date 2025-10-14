import { Stack } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DiscoverLayout() {
  const colorScheme = useColorScheme();
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
          headerRight: () => (
            <Pressable onPress={() => console.log("profile")}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
