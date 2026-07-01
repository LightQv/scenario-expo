import { requireNativeModule } from "expo-modules-core";

type ScenarioToastModule = {
  show: (message: string, type: "success" | "error" | "pending") => void;
};

export default requireNativeModule<ScenarioToastModule>("ScenarioToast");
