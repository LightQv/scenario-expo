import { StyleSheet, View, PlatformColor } from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import {
  Form,
  Host,
  SecureField,
  Section,
  TextField,
  VStack,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  keyboardType,
  scrollContentBackground,
  submitLabel,
  textContentType,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import {
  AuthFooterLink,
  AuthMessage,
  AuthSubmitRow,
} from "@/components/auth/NativeAuthComponents";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext, useUserContext } from "@/contexts";
import i18n from "@/services/i18n";
import { loginSchema } from "@/services/validators";

export default function LoginScreen() {
  const { login, loader } = useUserContext();
  const { colors } = useThemeContext();
  const [authError, setAuthError] = useState<string | null>(null);

  const fieldModifiers = [
    settingsRegularFont(),
    autocorrectionDisabled(),
    submitLabel("done"),
    textInputAutocapitalization("never"),
  ];

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Host style={styles.host}>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values) => {
            try {
              setAuthError(null);
              await login(values.email, values.password);
            } catch (error) {
              setAuthError(
                error instanceof Error ? error.message : i18n.t("toast.error"),
              );
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => {
            const validationError =
              touched.email && errors.email
                ? errors.email
                : touched.password && errors.password
                  ? errors.password
                  : null;
            const disabled = !loginSchema.isValidSync(values) || loader;

            return (
              <Form modifiers={[scrollContentBackground("hidden")]}> 
                <Section
                  footer={
                    <VStack alignment="leading" spacing={8}>
                      {authError ? (
                        <AuthMessage message={authError} color={colors.error} icon />
                      ) : validationError ? (
                        <AuthMessage message={validationError} color={colors.error} />
                      ) : null}
                      <AuthFooterLink
                        text={i18n.t("form.auth.link.forgot")}
                        alignment="right"
                        tintColor={colors.main}
                        onPress={() => router.push("/(modal)/forgot-password")}
                      />
                    </VStack>
                  }
                >
                  <TextField
                    placeholder={i18n.t("form.auth.placeholder.email")}
                    onTextChange={(value) => {
                      setAuthError(null);
                      handleChange("email")(value);
                    }}
                    modifiers={[
                      ...fieldModifiers,
                      keyboardType("email-address"),
                      textContentType("emailAddress"),
                    ]}
                  />
                  <SecureField
                    placeholder={i18n.t("form.auth.placeholder.password")}
                    onTextChange={(value) => {
                      setAuthError(null);
                      handleChange("password")(value);
                    }}
                    modifiers={[
                      ...fieldModifiers,
                      keyboardType("default"),
                      textContentType("password"),
                    ]}
                  />
                </Section>

                <Section
                  footer={
                    <AuthFooterLink
                      text={i18n.t("form.auth.switch.login.number1")}
                      actionText={i18n.t("form.auth.switch.login.number2")}
                      alignment="center"
                      tintColor={colors.main}
                      onPress={() => router.push("/(modal)/register")}
                    />
                  }
                >
                  <AuthSubmitRow
                    label={
                      loader
                        ? i18n.t("form.auth.submit.loading")
                        : i18n.t("form.auth.submit.login")
                    }
                    disabled={disabled}
                    tintColor={colors.main}
                    onPress={() => handleSubmit()}
                  />
                </Section>
              </Form>
            );
          }}
        </Formik>
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
    marginTop: -12,
  },
});
