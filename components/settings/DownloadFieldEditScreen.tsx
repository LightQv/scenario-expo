import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import {
  Form,
  Host,
  SecureField,
  Section,
  TextField,
  useNativeState,
  HStack,
  Spacer,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import {
  keyboardType,
  scrollContentBackground,
  submitLabel,
} from "@expo/ui/swift-ui/modifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import { notifyError } from "@/components/toasts/Toast";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

type DownloadFieldEditScreenProps = {
  placeholder: string;
  initialValue?: string;
  secret?: boolean;
  keyboard?: "url" | "default";
  onSave: (value: string) => Promise<void>;
};

export default function DownloadFieldEditScreen({
  placeholder,
  initialValue = "",
  secret = false,
  keyboard = "default",
  onSave,
}: DownloadFieldEditScreenProps) {
  const text = useNativeState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (text.value !== initialValue) {
      text.value = initialValue;
    }
  }, [initialValue, text]);

  const validate = async () => {
    if (saving) return;
    const value = text.value.trim();
    if (!value) return;

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

  const fieldModifiers = [
    settingsRegularFont(),
    keyboardType(keyboard),
    submitLabel("done"),
  ];

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Validate"
          disabled={saving}
          icon={"checkmark" as never}
          onPress={validate}
        />
      </Stack.Toolbar>
      <Host style={styles.host}>
        <Form modifiers={[scrollContentBackground("hidden")]}>
          <Section>
            {secret ? (
              <SecureField
                text={text}
                placeholder={placeholder}
                modifiers={fieldModifiers}
              />
            ) : (
              <HStack>
                <SwiftText modifiers={[settingsRegularFont()]}>
                  {i18n.t("screen.settings.fields.server")}
                </SwiftText>
                <Spacer minLength={68} />
                <TextField
                  text={text}
                  placeholder={placeholder}
                  modifiers={fieldModifiers}
                />
              </HStack>
            )}
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
