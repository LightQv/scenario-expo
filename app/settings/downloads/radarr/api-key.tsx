import SecretEditScreen from "@/components/ui/SecretEditScreen";
import i18n from "@/services/i18n";
import { patchRadarrSettings } from "@/services/downloadSettings";

export default function RadarrApiKeyScreen() {
  return (
    <SecretEditScreen
      title={i18n.t("screen.settings.secretEdit.apiKey.title")}
      subtitle={i18n.t("screen.settings.secretEdit.apiKey.subtitle")}
      placeholder={i18n.t("screen.settings.fields.apiKey")}
      icon="key.circle"
      onSave={async (api_key) => {
        await patchRadarrSettings({ api_key });
      }}
    />
  );
}
