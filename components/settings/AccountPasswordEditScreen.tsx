import { Stack } from "expo-router";
import { useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import {
  Form,
  Host,
  Image,
  Section,
  SecureField,
  Text,
  VStack,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  foregroundStyle,
  frame,
  keyboardType,
  listRowBackground,
  listRowSeparator,
  multilineTextAlignment,
  padding,
  scrollContentBackground,
  submitLabel,
  textContentType,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import NativeSettingsMessage from "@/components/settings/NativeSettingsMessage";
import {
  settingsBoldFont,
  settingsRegularFont,
} from "@/components/settings/nativeSettingsModifiers";
import { notifyError } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext } from "@/contexts";
import { THEME_COLORS } from "@/constants/theme";
import i18n from "@/services/i18n";
import { updatePasswordSchema } from "@/services/validators";

type AccountPasswordEditScreenProps = {
  onSave: (password: string, confirmPassword: string) => Promise<void>;
};

export default function AccountPasswordEditScreen({
  onSave,
}: AccountPasswordEditScreenProps) {
  const { colors } = useThemeContext();
  const password = useNativeState("");
  const confirmPassword = useNativeState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = async () => {
    if (saving) return;

    try {
      await updatePasswordSchema.validate({
        password: password.value,
        confirmPassword: confirmPassword.value,
      });
      setError(null);
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : i18n.t("toast.error"),
      );
      return;
    }

    setSaving(true);
    try {
      await onSave(password.value, confirmPassword.value);
    } catch {
      notifyError(i18n.t("toast.error"));
      setSaving(false);
    }
  };

  const fieldModifiers = [
    settingsRegularFont(),
    autocorrectionDisabled(),
    keyboardType("default"),
    submitLabel("done"),
    textContentType("newPassword"),
    textInputAutocapitalization("never"),
  ];

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={i18n.t("navigation.actions.validate")}
          disabled={saving}
          icon={"checkmark" as never}
          onPress={validate}
        />
      </Stack.Toolbar>
      <Host style={styles.host}>
        <Form
          modifiers={[scrollContentBackground("hidden"), padding({ top: -28 })]}
        >
          <Section
            modifiers={[
              listRowBackground("clear"),
              listRowSeparator("hidden"),
              padding({ bottom: -12 }),
            ]}
          >
            <VStack alignment="leading" spacing={0}>
              <VStack
                alignment="center"
                spacing={0}
                modifiers={[
                  frame({ maxWidth: 999 }),
                  padding({ bottom: 32, top: -16 }),
                ]}
              >
                <Image systemName="lock.circle" size={68} color={THEME_COLORS.main} />
              </VStack>

              <VStack alignment="leading" spacing={8}>
                <Text modifiers={[settingsBoldFont(25)]}>
                  {i18n.t("screen.settings.account.passwordEdit.title")}
                </Text>
                <Text
                  modifiers={[
                    settingsRegularFont(18),
                    foregroundStyle({ type: "hierarchical", style: "secondary" }),
                    multilineTextAlignment("leading"),
                  ]}
                >
                  {i18n.t("screen.settings.account.passwordEdit.subtitle")}
                </Text>
              </VStack>
            </VStack>
          </Section>

          <Section
            footer={
              error ? (
                <NativeSettingsMessage message={error} color={colors.error} />
              ) : undefined
            }
          >
            <SecureField
              text={password}
              placeholder={i18n.t("screen.settings.account.placeholders.password")}
              onTextChange={() => setError(null)}
              modifiers={fieldModifiers}
            />
            <SecureField
              text={confirmPassword}
              placeholder={i18n.t(
                "screen.settings.account.placeholders.confirmPassword",
              )}
              onTextChange={() => setError(null)}
              modifiers={fieldModifiers}
            />
          </Section>
        </Form>
      </Host>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  host: {
    flex: 1,
  },
});
