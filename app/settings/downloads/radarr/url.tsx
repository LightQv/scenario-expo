import { useEffect, useState } from "react";
import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import i18n from "@/services/i18n";
import { getRadarrSettings, patchRadarrSettings } from "@/services/downloadSettings";

export default function RadarrUrlScreen() {
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    getRadarrSettings().then((settings) => setInitialValue(settings.url ?? "")).catch(() => {});
  }, []);

  return (
    <DownloadFieldEditScreen
      title="URL"
      placeholder="URL"
      initialValue={initialValue}
      keyboard="url"
      onSave={async (url) => {
        await patchRadarrSettings({ url });
      }}
    />
  );
}
