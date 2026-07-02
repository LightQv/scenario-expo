import { Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import type { SFSymbol } from "sf-symbols-typescript";
import {
  Form,
  Host,
  Image,
  Section,
  SecureField,
  Text,
  useNativeState,
  VStack,
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
import GoBackButton from "@/components/ui/GoBackButton";
import { notifyError } from "@/components/toasts/Toast";
import {
  settingsBoldFont,
  settingsRegularFont,
} from "@/components/settings/nativeSettingsModifiers";
import { useThemeContext } from "@/contexts";
import i18n from "@/services/i18n";

type SecretEditScreenProps = {
  title: string;
  subtitle: string;
  placeholder: string;
  icon?: SFSymbol;
  initialValue?: string;
  keyboard?: "default" | "url" | "ascii-capable";
  onSave: (value: string) => Promise<void>;
};

export default function SecretEditScreen({
  title,
  subtitle,
  placeholder,
  icon = "key.circle",
  initialValue = "",
  keyboard = "default",
  onSave,
}: SecretEditScreenProps) {
  const { colors } = useThemeContext();
  const text = useNativeState(initialValue);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const isSubmitDisabled = saving || !value.trim();

  useEffect(() => {
    if (text.value !== initialValue) {
      text.value = initialValue;
      setValue(initialValue);
    }
  }, [initialValue, text]);

  const validate = async () => {
    if (isSubmitDisabled) return;

    setSaving(true);
    try {
      await onSave(value.trim());
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
          disabled={isSubmitDisabled}
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
                <Image systemName={icon} size={68} color={colors.main} />
              </VStack>

              <VStack alignment="leading" spacing={8}>
                <Text
                  modifiers={[
                    settingsBoldFont(25),
                    foregroundStyle({ type: "hierarchical", style: "primary" }),
                  ]}
                >
                  {title}
                </Text>
                <Text
                  modifiers={[
                    settingsRegularFont(18),
                    foregroundStyle({
                      type: "hierarchical",
                      style: "secondary",
                    }),
                    multilineTextAlignment("leading"),
                  ]}
                >
                  {subtitle}
                </Text>
              </VStack>
            </VStack>
          </Section>

          <Section>
            <SecureField
              text={text}
              placeholder={placeholder}
              onTextChange={setValue}
              modifiers={[
                settingsRegularFont(),
                autocorrectionDisabled(),
                keyboardType(keyboard),
                submitLabel("done"),
                textContentType("password"),
                textInputAutocapitalization("never"),
              ]}
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
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: {
    flex: 1,
  },
});
