import { toast } from "@backpackapp-io/react-native-toast";
import i18n from "@/services/i18n";

// Toast Success
export const notifySuccess = (message: string) => {
  toast.success(message, { id: "success" });
};

// Toast Promise
export const notifyPromise = (promise: any) => {
  toast.promise(promise, {
    loading: i18n.t("toast.promise.loading"),
    success: i18n.t("toast.promise.success"),
    error: i18n.t("toast.error"),
  });
};

// Toast Error
export const notifyError = (message: string) =>
  toast.error(message, { id: "error" });
