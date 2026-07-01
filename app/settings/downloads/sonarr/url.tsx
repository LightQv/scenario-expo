import { useEffect, useState } from "react";
import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import i18n from "@/services/i18n";
import { getSonarrSettings, patchSonarrSettings } from "@/services/downloadSettings";

export default function SonarrUrlScreen() {
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    getSonarrSettings().then((settings) => setInitialValue(settings.url ?? "")).catch(() => {});
  }, []);

  return (
    <DownloadFieldEditScreen
      placeholder={i18n.t("screen.settings.fields.url")}
      initialValue={initialValue}
      keyboard="url"
      onSave={async (url) => {
        await patchSonarrSettings({ url });
      }}
    />
  );
}
