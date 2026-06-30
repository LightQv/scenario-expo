import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { requireNativeModule } from "expo-modules-core";

export type AppToastType = "success" | "error";

type ScenarioToastModule = {
  show: (message: string, type: AppToastType) => void;
};

let scenarioToast: ScenarioToastModule | null = null;

if (Platform.OS === "ios") {
  try {
    scenarioToast = requireNativeModule<ScenarioToastModule>("ScenarioToast");
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "ScenarioToast native module is unavailable. Rebuild the iOS app to enable native toasts.",
        error,
      );
    }
  }
}

const showToast = (type: AppToastType, message: string) => {
  scenarioToast?.show(message, type);
};

// Toast Success
export const notifySuccess = (message: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  showToast("success", message);
};

// Toast Error
export const notifyError = (message: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  showToast("error", message);
};
