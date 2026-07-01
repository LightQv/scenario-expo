import { StyleSheet, View, PlatformColor } from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import { Form, Host, Section, TextField } from "@expo/ui/swift-ui";
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
  AuthDescription,
  AuthFooterLink,
  AuthMessage,
  AuthSubmitRow,
} from "@/components/auth/NativeAuthComponents";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import GoBackButton from "@/components/ui/GoBackButton";
import { useThemeContext, useUserContext } from "@/contexts";
import i18n from "@/services/i18n";
import { forgottenSchema } from "@/services/validators";

export default function ForgotPasswordScreen() {
  const { forgotPassword, loader } = useUserContext();
  const { colors } = useThemeContext();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fieldModifiers = [
    settingsRegularFont(),
    autocorrectionDisabled(),
    submitLabel("done"),
    textInputAutocapitalization("never"),
    keyboardType("email-address"),
    textContentType("emailAddress"),
  ];

  return (
    <View style={styles.container}>
      <GoBackButton variant="close" />
      <Host style={styles.host}>
        <Formik
          initialValues={{ email: "" }}
          validationSchema={forgottenSchema}
          onSubmit={async (values) => {
            try {
              setFormError(null);
              setFormSuccess(null);
              await forgotPassword(values.email);
              setFormSuccess(i18n.t("toast.success.forgot"));
            } catch (error) {
              setFormError(
                error instanceof Error ? error.message : i18n.t("toast.error"),
              );
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => {
            const validationError = touched.email && errors.email ? errors.email : null;
            const message = formError ?? formSuccess ?? validationError;
            const messageColor = formError || validationError ? colors.error : colors.main;
            const disabled = !forgottenSchema.isValidSync(values) || loader;

            return (
              <Form modifiers={[scrollContentBackground("hidden")]}> 
                <Section>
                  <AuthDescription text={i18n.t("form.auth.title.forgot.subtitle")} />
                </Section>

                <Section
                  footer={
                    message ? (
                      <AuthMessage
                        message={message}
                        color={messageColor}
                        icon={Boolean(formError || validationError)}
                      />
                    ) : undefined
                  }
                >
                  <TextField
                    placeholder={i18n.t("form.auth.placeholder.email")}
                    onTextChange={(value) => {
                      setFormError(null);
                      setFormSuccess(null);
                      handleChange("email")(value);
                    }}
                    modifiers={fieldModifiers}
                  />
                </Section>

                <Section
                  footer={
                    <AuthFooterLink
                      text={i18n.t("form.auth.switch.forgot.number1")}
                      actionText={i18n.t("form.auth.switch.forgot.number2")}
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
                        : i18n.t("form.auth.submit.forgot")
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
