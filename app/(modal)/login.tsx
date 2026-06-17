import {
  StyleSheet,
  View,
  Text,
  TextInput,
  PlatformColor,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Formik } from "formik";
import { loginSchema } from "@/services/validators";
import i18n from "@/services/i18n";
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function LoginScreen() {
  const { login, loader } = useUserContext();
  const { colors } = useThemeContext();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <Text
                    style={[styles.label, { color: PlatformColor("label") }]}
                  >
                    {i18n.t("form.auth.label.email")}
                  </Text>
                  {errors.email && touched.email && (
                    <Text
                      style={[
                        styles.errorIndicator,
                        { color: colors.error },
                      ]}
                    >
                      {" *"}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: PlatformColor(
                        "secondarySystemBackground",
                      ),
                      borderColor:
                        errors.email && touched.email
                          ? colors.error
                          : PlatformColor("separator"),
                    },
                  ]}
                >
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    onChangeText={(value) => {
                      setAuthError(null);
                      handleChange("email")(value);
                    }}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    placeholder={i18n.t("form.auth.placeholder.email")}
                    placeholderTextColor={PlatformColor("placeholderText")}
                    style={[styles.input, { color: PlatformColor("label") }]}
                    cursorColor={colors.main}
                    selectionColor={colors.main}
                  />
                </View>
                {errors.email && touched.email && (
                  <Text
                    style={[styles.errorText, { color: colors.error }]}
                  >
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Field */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <Text
                    style={[styles.label, { color: PlatformColor("label") }]}
                  >
                    {i18n.t("form.auth.label.password")}
                  </Text>
                  {errors.password && touched.password && (
                    <Text
                      style={[
                        styles.errorIndicator,
                        { color: colors.error },
                      ]}
                    >
                      {" *"}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: PlatformColor(
                        "secondarySystemBackground",
                      ),
                      borderColor:
                        errors.password && touched.password
                          ? colors.error
                          : PlatformColor("separator"),
                    },
                  ]}
                >
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="password"
                    onChangeText={(value) => {
                      setAuthError(null);
                      handleChange("password")(value);
                    }}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    placeholder={i18n.t("form.auth.placeholder.password")}
                    placeholderTextColor={PlatformColor("placeholderText")}
                    style={[styles.input, { color: PlatformColor("label") }]}
                    cursorColor={colors.main}
                    selectionColor={colors.main}
                    secureTextEntry={hidePassword}
                  />
                  <TouchableOpacity
                    onPress={() => setHidePassword(!hidePassword)}
                    style={styles.passwordToggle}
                    activeOpacity={BUTTON.opacity}
                  >
                    <Ionicons
                      name={hidePassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={PlatformColor("secondaryLabel")}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text
                    style={[styles.errorText, { color: colors.error }]}
                  >
                    {errors.password}
                  </Text>
                )}
                {/* Forgot Password Link */}
                <Link href="/(modal)/forgot-password" asChild>
                  <TouchableOpacity
                    style={styles.forgotPasswordContainer}
                    activeOpacity={BUTTON.opacity}
                  >
                    <Text
                      style={[
                        styles.forgotPasswordText,
                        { color: colors.main },
                      ]}
                    >
                      {i18n.t("form.auth.link.forgot")}
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {authError && (
                <View
                  style={[
                    styles.inlineMessage,
                    {
                      backgroundColor: PlatformColor(
                        "secondarySystemBackground",
                      ),
                      borderColor: colors.error,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={colors.error}
                  />
                  <Text
                    style={[styles.inlineMessageText, { color: colors.error }]}
                  >
                    {authError}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                disabled={!loginSchema.isValidSync(values) || loader}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      !loginSchema.isValidSync(values) || loader
                        ? PlatformColor("systemGray4")
                        : colors.main,
                  },
                ]}
                activeOpacity={BUTTON.opacity}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color:
                        !loginSchema.isValidSync(values) || loader
                          ? PlatformColor("systemGray")
                          : "#fff",
                    },
                  ]}
                >
                  {loader
                    ? i18n.t("form.auth.submit.loading")
                    : i18n.t("form.auth.submit.login")}
                </Text>
              </TouchableOpacity>

              {/* Register Link */}
              <Link href="/(modal)/register" asChild>
                <TouchableOpacity
                  style={styles.registerLinkContainer}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.registerLinkText,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                  >
                    {i18n.t("form.auth.switch.login.number1")}{" "}
                    <Text
                      style={[
                        styles.registerLinkTextBold,
                        { color: colors.main },
                      ]}
                    >
                      {i18n.t("form.auth.switch.login.number2")}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: PlatformColor("systemBackground"),
  },
  scrollContent: {
    padding: TOKENS.margin.horizontal,
    paddingTop: TOKENS.modal.paddingTop,
  },
  form: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.lg,
  },
  errorIndicator: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    height: "100%",
  },
  passwordToggle: {
    padding: 4,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    marginTop: -4,
  },
  inlineMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineMessageText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
    lineHeight: 18,
  },
  submitButton: {
    height: 52,
    borderRadius: TOKENS.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  submitButtonText: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  forgotPasswordText: {
    fontFamily: FONTS.medium,
    fontSize: TOKENS.font.md,
  },
  registerLinkContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  registerLinkText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    textAlign: "center",
  },
  registerLinkTextBold: {
    fontFamily: FONTS.bold,
  },
});
