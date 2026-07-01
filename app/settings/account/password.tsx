import { router } from "expo-router";
import AccountPasswordEditScreen from "@/components/settings/AccountPasswordEditScreen";
import { useUserContext } from "@/contexts";
import { apiFetch } from "@/services/instances";

export default function AccountPasswordScreen() {
  const { user, logout } = useUserContext();

  return (
    <AccountPasswordEditScreen
      onSave={async (password, confirmPassword) => {
        if (!user?.id) return;
        await apiFetch(`/api/v1/users/password/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({
            password,
            confirm_password: confirmPassword,
          }),
        });
        await logout();
        router.dismissAll();
        router.replace("/(tabs)/discover");
      }}
    />
  );
}
