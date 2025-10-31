import { Stack } from "expo-router";
import ProfileHeaderButton from "@/components/ui/ProfileHeaderButton";

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
          headerRight: () => <ProfileHeaderButton />,
        }}
      />
    </Stack>
  );
}
