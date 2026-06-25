import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="delete-account"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/radarr/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/sonarr/index"
        options={{
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="downloads/radarr/url"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="downloads/radarr/api-key"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="downloads/radarr/webhook-secret"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="downloads/sonarr/url"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="downloads/sonarr/api-key"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="downloads/sonarr/webhook-secret"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
