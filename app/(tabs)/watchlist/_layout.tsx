import { Stack } from "expo-router"

export default function WatchlistLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Watchlist",
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  )
}
