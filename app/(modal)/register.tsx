import { StyleSheet, View, PlatformColor } from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import {
  Form,
  Host,
  SecureField,
  Section,
  TextField,
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
import { registerSchema } from "@/services/validators";

export default function RegisterScreen() {
  const { register, loader } = useUserContext();
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
          initialValues={{
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={registerSchema}
          onSubmit={async (values) => {
            try {
              setAuthError(null);
              await register(
                values.username,
                values.email,
                values.password,
                values.confirmPassword,
              );
            } catch (error) {
              setAuthError(
                error instanceof Error ? error.message : i18n.t("toast.error"),
              );
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => {
            const validationError =
              touched.username && errors.username
                ? errors.username
                : touched.email && errors.email
                  ? errors.email
                  : touched.password && errors.password
                    ? errors.password
                    : touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : null;
            const disabled = !registerSchema.isValidSync(values) || loader;

            return (
              <Form modifiers={[scrollContentBackground("hidden")]}> 
                <Section
                  footer={
                    authError ? (
                      <AuthMessage message={authError} color={colors.error} icon />
                    ) : validationError ? (
                      <AuthMessage message={validationError} color={colors.error} />
                    ) : undefined
                  }
                >
                  <TextField
                    placeholder={i18n.t("form.auth.placeholder.username")}
                    onTextChange={(value) => {
                      setAuthError(null);
                      handleChange("username")(value);
                    }}
                    modifiers={[
                      ...fieldModifiers,
                      keyboardType("default"),
                      textContentType("username"),
                    ]}
                  />
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
                      textContentType("newPassword"),
                    ]}
                  />
                  <SecureField
                    placeholder={i18n.t("form.auth.placeholder.confirmPassword")}
                    onTextChange={(value) => {
                      setAuthError(null);
                      handleChange("confirmPassword")(value);
                    }}
                    modifiers={[
                      ...fieldModifiers,
                      keyboardType("default"),
                      textContentType("newPassword"),
                    ]}
                  />
                </Section>

                <Section
                  footer={
                    <AuthFooterLink
                      text={i18n.t("form.auth.switch.register.number1")}
                      actionText={i18n.t("form.auth.switch.register.number2")}
                      alignment="center"
                      tintColor={colors.main}
                      onPress={() => router.back()}
                    />
                  }
                >
                  <AuthSubmitRow
                    label={
                      loader
                        ? i18n.t("form.auth.submit.loading")
                        : i18n.t("form.auth.submit.register")
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
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: {
    flex: 1,
    marginTop: -12,
  },
});
