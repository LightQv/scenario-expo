import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import i18n from "@/services/i18n";
import { patchSonarrSettings } from "@/services/downloadSettings";

export default function SonarrApiKeyScreen() {
  return (
    <DownloadFieldEditScreen
      placeholder={i18n.t("screen.settings.fields.apiKey")}
      secret
      onSave={async (api_key) => {
        await patchSonarrSettings({ api_key });
      }}
    />
  );
}
