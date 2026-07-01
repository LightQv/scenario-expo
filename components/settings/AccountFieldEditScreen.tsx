import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import {
  Form,
  HStack,
  Host,
  Section,
  Spacer,
  Text as SwiftText,
  TextField,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  keyboardType,
  scrollContentBackground,
  submitLabel,
  textContentType,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import type { AnyObjectSchema } from "yup";
import NativeSettingsMessage from "@/components/settings/NativeSettingsMessage";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { notifyError } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";

type AccountFieldEditScreenProps = {
  label: string;
  field: string;
  initialValue: string;
  placeholder: string;
  keyboard?: "default" | "email-address";
  contentType?: "username" | "emailAddress";
  schema: AnyObjectSchema;
  onSave: (value: string) => Promise<void>;
};

export default function AccountFieldEditScreen({
  label,
  field,
  initialValue,
  placeholder,
  keyboard = "default",
  contentType = "username",
  schema,
  onSave,
}: AccountFieldEditScreenProps) {
  const { colors } = useThemeContext();
  const text = useNativeState(initialValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (text.value !== initialValue) {
      text.value = initialValue;
    }
  }, [initialValue, text]);

  const validate = async () => {
    if (saving) return;

    const value = text.value.trim();
    try {
      await schema.validate({ [field]: value });
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
      await onSave(value);
      router.back();
    } catch {
      notifyError(i18n.t("toast.error"));
    } finally {
      setSaving(false);
    }
  };

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
        <Form modifiers={[scrollContentBackground("hidden")]}> 
          <Section
            footer={
              error ? (
                <NativeSettingsMessage message={error} color={colors.error} />
              ) : undefined
            }
          >
            <HStack>
              <SwiftText modifiers={[settingsRegularFont()]}>{label}</SwiftText>
              <Spacer minLength={68} />
              <TextField
                text={text}
                placeholder={placeholder}
                onTextChange={() => setError(null)}
                modifiers={[
                  settingsRegularFont(),
                  autocorrectionDisabled(),
                  keyboardType(keyboard),
                  submitLabel("done"),
                  textContentType(contentType),
                  textInputAutocapitalization("never"),
                ]}
              />
            </HStack>
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
    paddingTop: TOKENS.modal.paddingTop,
  },
});
