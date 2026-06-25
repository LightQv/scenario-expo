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
} from "@expo/ui/swift-ui";
import {
  keyboardType,
  scrollContentBackground,
  submitLabel,
} from "@expo/ui/swift-ui/modifiers";
import FormSubmitHeaderButton from "@/components/ui/FormSubmitHeaderButton";
import GoBackButton from "@/components/ui/GoBackButton";
import { notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";

type DownloadFieldEditScreenProps = {
  title: string;
  placeholder: string;
  initialValue?: string;
  secret?: boolean;
  keyboard?: "url" | "default";
  onSave: (value: string) => Promise<void>;
};

export default function DownloadFieldEditScreen({
  title,
  placeholder,
  initialValue = "",
  secret = false,
  keyboard = "default",
  onSave,
}: DownloadFieldEditScreenProps) {
  const text = useNativeState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    text.value = initialValue;
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
    keyboardType(keyboard),
    submitLabel("done"),
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: title,
          headerTransparent: false,
          headerLeft: () => <GoBackButton variant="close" />,
          headerRight: () => (
            <FormSubmitHeaderButton onPress={validate} disabled={saving} />
          ),
        }}
      />
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
              <TextField
                text={text}
                placeholder={placeholder}
                modifiers={fieldModifiers}
              />
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
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: {
    flex: 1,
  },
});
