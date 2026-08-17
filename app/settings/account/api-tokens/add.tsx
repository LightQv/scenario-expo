import { Stack, router } from "expo-router";
import { useState, type ReactNode } from "react";
import { PlatformColor, StyleSheet, View } from "react-native";
import {
  Button,
  Form,
  HStack,
  Host,
  Image,
  Section,
  Spacer,
  Text as SwiftText,
  TextField,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  buttonStyle,
  foregroundStyle,
  frame,
  scrollContentBackground,
  submitLabel,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import NativeSettingsMessage from "@/components/settings/NativeSettingsMessage";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { notifyError } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import { TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";
import { createApiToken, generateApiToken } from "@/services/apiTokens";
import i18n from "@/services/i18n";

const FIELD_LEADING_WIDTH = 122;

export default function AddApiTokenScreen() {
  const { colors } = useThemeContext();
  const name = useNativeState("");
  const token = useNativeState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    try {
      const response = await generateApiToken();
      token.value = response.token;
      setError(null);
    } catch {
      notifyError(i18n.t("toast.error"));
    }
  };

  const save = async () => {
    const nextName = name.value.trim();
    const nextToken = token.value.trim();
    if (saving) return;
    if (!nextName || !nextToken) {
      setError(i18n.t("screen.settings.apiTokens.required"));
      return;
    }

    setSaving(true);
    try {
      await createApiToken({ name: nextName, token: nextToken });
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
      <Stack.Screen options={{ title: i18n.t("screen.settings.apiTokens.addTitle") }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={i18n.t("screen.settings.common.validate")}
          disabled={saving}
          icon={"checkmark" as never}
          onPress={save}
        />
      </Stack.Toolbar>
      <Host style={styles.host}>
        <Form modifiers={[scrollContentBackground("hidden")]}> 
          <Section
            footer={
              error ? <NativeSettingsMessage message={error} color={colors.error} /> : undefined
            }
          >
            <FieldRow label={i18n.t("screen.settings.apiTokens.name")}>
              <TextField
                text={name}
                placeholder={i18n.t("screen.settings.apiTokens.namePlaceholder")}
                onTextChange={() => setError(null)}
                modifiers={[
                  settingsRegularFont(),
                  autocorrectionDisabled(),
                  submitLabel("next"),
                  textInputAutocapitalization("never"),
                ]}
              />
            </FieldRow>

            <FieldRow
              label={i18n.t("screen.settings.apiTokens.token")}
              trailing={
                <Button onPress={generate} modifiers={[buttonStyle("borderless")]}> 
                  <Image systemName="wand.and.stars" size={17} color={colors.main} />
                </Button>
              }
            >
              <TextField
                text={token}
                placeholder={i18n.t("screen.settings.apiTokens.tokenPlaceholder")}
                onTextChange={() => setError(null)}
                modifiers={[
                  settingsRegularFont(),
                  autocorrectionDisabled(),
                  submitLabel("done"),
                  textInputAutocapitalization("never"),
                ]}
              />
            </FieldRow>
          </Section>

          <Section>
            <SwiftText
              modifiers={[
                settingsRegularFont(TOKENS.font.md),
                foregroundStyle({ type: "hierarchical", style: "secondary" }),
              ]}
            >
              {i18n.t("screen.settings.apiTokens.addFooter")}
            </SwiftText>
          </Section>
        </Form>
      </Host>
    </View>
  );
}

function FieldRow({
  label,
  children,
  trailing,
}: {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <HStack alignment="center" spacing={8}>
      <HStack modifiers={[frame({ width: FIELD_LEADING_WIDTH })]}>
        <SwiftText modifiers={[settingsRegularFont()]}>{label}</SwiftText>
        <Spacer />
      </HStack>
      {children}
      {trailing}
    </HStack>
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
