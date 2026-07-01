import SecretEditScreen from "@/components/ui/SecretEditScreen";
import i18n from "@/services/i18n";
import { patchRadarrSettings } from "@/services/downloadSettings";

export default function RadarrWebhookSecretScreen() {
  return (
    <SecretEditScreen
      title={i18n.t("screen.settings.secretEdit.webhookSecret.title")}
      subtitle={i18n.t("screen.settings.secretEdit.webhookSecret.subtitle")}
      placeholder={i18n.t("screen.settings.fields.webhookSecret")}
      icon="lock.shield.fill"
      onSave={async (webhook_secret) => {
        await patchRadarrSettings({ webhook_secret });
      }}
    />
  );
}
