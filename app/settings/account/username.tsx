import AccountFieldEditScreen from "@/components/settings/AccountFieldEditScreen";
import { useUserContext } from "@/contexts";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { updateUsernameSchema } from "@/services/validators";

export default function AccountUsernameScreen() {
  const { user, refreshUser } = useUserContext();

  return (
    <AccountFieldEditScreen
      label={i18n.t("screen.settings.account.username")}
      field="username"
      initialValue={user?.username ?? ""}
      placeholder={i18n.t("screen.settings.account.placeholders.username")}
      contentType="username"
      schema={updateUsernameSchema}
      onSave={async (username) => {
        if (!user?.id) return;
        await apiFetch(`/api/v1/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({ username }),
        });
        await refreshUser();
      }}
    />
  );
}
