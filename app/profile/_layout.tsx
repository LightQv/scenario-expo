import { Stack } from "expo-router";
import GoBackButton from "@/components/ui/GoBackButton";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => <GoBackButton />,
        }}
      />
      <Stack.Screen
        name="[viewType]"
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => <GoBackButton />,
        }}
      />
    </Stack>
  );
}
