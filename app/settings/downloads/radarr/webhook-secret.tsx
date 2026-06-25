import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import i18n from "@/services/i18n";
import { patchRadarrSettings } from "@/services/downloadSettings";

export default function RadarrWebhookSecretScreen() {
  return (
    <DownloadFieldEditScreen
      title={i18n.t("screen.settings.fields.webhookSecret")}
      placeholder={i18n.t("screen.settings.fields.webhookSecret")}
      secret
      onSave={async (webhook_secret) => {
        await patchRadarrSettings({ webhook_secret });
      }}
    />
  );
}
