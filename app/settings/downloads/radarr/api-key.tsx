import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import i18n from "@/services/i18n";
import { patchRadarrSettings } from "@/services/downloadSettings";

export default function RadarrApiKeyScreen() {
  return (
    <DownloadFieldEditScreen
      placeholder={i18n.t("screen.settings.fields.apiKey")}
      secret
      onSave={async (api_key) => {
        await patchRadarrSettings({ api_key });
      }}
    />
  );
}
