import AccountFieldEditScreen from "@/components/settings/AccountFieldEditScreen";
import { useUserContext } from "@/contexts";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { updateEmailSchema } from "@/services/validators";

export default function AccountEmailScreen() {
  const { user, refreshUser } = useUserContext();

  return (
    <AccountFieldEditScreen
      label={i18n.t("screen.settings.account.email")}
      field="email"
      initialValue={user?.email ?? ""}
      placeholder={i18n.t("screen.settings.account.placeholders.email")}
      keyboard="email-address"
      contentType="emailAddress"
      schema={updateEmailSchema}
      onSave={async (email) => {
        if (!user?.id) return;
        await apiFetch(`/api/v1/users/email/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({ email }),
        });
        await refreshUser();
      }}
    />
  );
}
