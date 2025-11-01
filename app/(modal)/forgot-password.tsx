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
import { Formik } from "formik";
import { forgottenSchema } from "@/services/validators";
import i18n from "@/services/i18n";
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const { forgotPassword, loader } = useUserContext();
  const { colors } = useThemeContext();

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
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.subtitle,
              { color: PlatformColor("secondaryLabel") },
            ]}
          >
            {i18n.t("form.auth.title.forgot.subtitle")}
          </Text>
        </View>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={forgottenSchema}
          onSubmit={(values) => {
            forgotPassword(values.email);
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
                    onChangeText={handleChange("email")}
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

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                disabled={!forgottenSchema.isValidSync(values) || loader}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      !forgottenSchema.isValidSync(values) || loader
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
                        !forgottenSchema.isValidSync(values) || loader
                          ? PlatformColor("systemGray")
                          : "#fff",
                    },
                  ]}
                >
                  {loader
                    ? i18n.t("form.auth.submit.loading")
                    : i18n.t("form.auth.submit.forgot")}
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                style={styles.loginLinkContainer}
                activeOpacity={BUTTON.opacity}
                onPress={() => router.back()}
              >
                <Text
                  style={[
                    styles.loginLinkText,
                    { color: PlatformColor("secondaryLabel") },
                  ]}
                >
                  {i18n.t("form.auth.switch.forgot.number1")}{" "}
                  <Text
                    style={[
                      styles.loginLinkTextBold,
                      { color: colors.main },
                    ]}
                  >
                    {i18n.t("form.auth.switch.forgot.number2")}
                  </Text>
                </Text>
              </TouchableOpacity>
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
  },
  titleContainer: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.header,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    lineHeight: 20,
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
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    marginTop: -4,
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
  loginLinkContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    textAlign: "center",
  },
  loginLinkTextBold: {
    fontFamily: FONTS.bold,
  },
});
