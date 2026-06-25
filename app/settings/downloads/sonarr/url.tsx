import { useEffect, useState } from "react";
import DownloadFieldEditScreen from "@/components/settings/DownloadFieldEditScreen";
import { getSonarrSettings, patchSonarrSettings } from "@/services/downloadSettings";

export default function SonarrUrlScreen() {
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    getSonarrSettings().then((settings) => setInitialValue(settings.url ?? "")).catch(() => {});
  }, []);

  return (
    <DownloadFieldEditScreen
      title="URL"
      placeholder="URL"
      initialValue={initialValue}
      keyboard="url"
      onSave={async (url) => {
        await patchSonarrSettings({ url });
      }}
    />
  );
}
