import { Stack } from "expo-router"
import { useState } from "react"

export default function SearchLayout() {
  const [search, setSearch] = useState("")
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Search",
          headerSearchBarOptions: {
            placement: "automatic",
            placeholder: "Search",
            onChangeText: (event) => {
              setSearch(event.nativeEvent.text)
            },
            onSearchButtonPress: () => {},
          },
        }}
      />
    </Stack>
  )
}
