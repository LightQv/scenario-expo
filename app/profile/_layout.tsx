import { Stack } from "expo-router";
import GoBackButton from "@/components/ui/GoBackButton";
import ProfileMenu from "@/components/profile/ProfileMenu";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => <GoBackButton />,
          headerRight: () => <ProfileMenu />,
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
