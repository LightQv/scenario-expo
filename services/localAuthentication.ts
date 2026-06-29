import * as LocalAuthentication from "expo-local-authentication";
import i18n from "@/services/i18n";

export type LocalAuthenticationStatus =
  | "success"
  | "unavailable"
  | "cancelled"
  | "failed";

export async function authenticateForSecretAccess(): Promise<LocalAuthenticationStatus> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    return "unavailable";
  }

  const result = await LocalAuthentication.authenticateAsync({
    cancelLabel: i18n.t("screen.settings.localAuth.cancel"),
    fallbackLabel: i18n.t("screen.settings.localAuth.fallback"),
    promptMessage: i18n.t("screen.settings.localAuth.prompt"),
  });

  if (result.success) return "success";
  if (
    result.error === "user_cancel" ||
    result.error === "system_cancel" ||
    result.error === "app_cancel"
  ) {
    return "cancelled";
  }

  return "failed";
}
