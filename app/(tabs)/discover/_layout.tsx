import { Stack } from "expo-router";

export default function DiscoverLayout() {
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
        }}
      />
    </Stack>
  );
}
