import { Stack } from "expo-router"

export default function DiscoverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Discover",
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  )
}
