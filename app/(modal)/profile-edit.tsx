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
  Alert,
} from "react-native";
import { useState, useLayoutEffect } from "react";
import { Formik } from "formik";
import { editProfileSchema } from "@/services/validators";
import i18n from "@/services/i18n";
import { useUserContext } from "@/contexts";
import { FONTS, TOKENS, THEME_COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import FormSubmitHeaderButton from "@/components/ui/FormSubmitHeaderButton";

export default function ProfileEditScreen() {
  const { user, logout } = useUserContext();
  const navigation = useNavigation();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!user) {
    router.replace("/(modal)/login");
    return null;
  }

  const handleSubmit = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Show confirmation alert
    Alert.alert(
      i18n.t("form.profile.update.confirmation.title"),
      i18n.t("form.profile.update.confirmation.message"),
      [
        {
          text: i18n.t("form.watchlist.cancel"),
          style: "cancel",
        },
        {
          text: i18n.t("form.watchlist.submit.update"),
          onPress: async () => {
            try {
              setIsSubmitting(true);

              // Call the API to update the user profile
              await apiFetch(`/api/v1/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({
                  username: values.username,
                  email: values.email,
                  password: values.password,
                }),
              });

              // Logout the user
              await logout();

              // Close the modal and navigate to discover
              router.dismissAll();
              router.replace("/(tabs)/discover");
            } catch (error: any) {
              console.error("Error updating profile:", error);
              setIsSubmitting(false);
              if (!error.message?.includes("403")) {
                notifyError(i18n.t("toast.error"));
              }
            }
          },
          style: "destructive",
        },
      ],
    );
  };

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
          initialValues={{
            username: user.username,
            email: user.email,
            password: "",
            confirmPassword: "",
          }}
          validationSchema={editProfileSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit: formikSubmit,
            values,
            errors,
            touched,
            setFieldTouched,
          }) => {
            // Update header with submit button
            useLayoutEffect(() => {
              navigation.setOptions({
                headerRight: () => (
                  <FormSubmitHeaderButton
                    onPress={() => {
                      // Touch all fields to show validation errors
                      setFieldTouched("username", true);
                      setFieldTouched("email", true);
                      setFieldTouched("password", true);
                      setFieldTouched("confirmPassword", true);
                      formikSubmit();
                    }}
                    disabled={
                      !editProfileSchema.isValidSync(values) || isSubmitting
                    }
                  />
                ),
              });
            }, [navigation, values, isSubmitting]);

            return (
              <View style={styles.form}>
                {/* Username Field */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Text
                      style={[styles.label, { color: PlatformColor("label") }]}
                    >
                      {i18n.t("form.auth.label.username")}
                    </Text>
                    {errors.username && touched.username && (
                      <Text
                        style={[
                          styles.errorIndicator,
                          { color: THEME_COLORS.error },
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
                          errors.username && touched.username
                            ? THEME_COLORS.error
                            : PlatformColor("separator"),
                      },
                    ]}
                  >
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="username"
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      value={values.username}
                      placeholder={i18n.t("form.auth.placeholder.username")}
                      placeholderTextColor={PlatformColor("placeholderText")}
                      style={[styles.input, { color: PlatformColor("label") }]}
                      cursorColor={THEME_COLORS.main}
                      selectionColor={THEME_COLORS.main}
                    />
                  </View>
                  {errors.username && touched.username && (
                    <Text
                      style={[styles.errorText, { color: THEME_COLORS.error }]}
                    >
                      {errors.username}
                    </Text>
                  )}
                </View>

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
                          { color: THEME_COLORS.error },
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
                            ? THEME_COLORS.error
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
                      cursorColor={THEME_COLORS.main}
                      selectionColor={THEME_COLORS.main}
                    />
                  </View>
                  {errors.email && touched.email && (
                    <Text
                      style={[styles.errorText, { color: THEME_COLORS.error }]}
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
                          { color: THEME_COLORS.error },
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
                            ? THEME_COLORS.error
                            : PlatformColor("separator"),
                      },
                    ]}
                  >
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                      placeholder={i18n.t("form.auth.placeholder.password")}
                      placeholderTextColor={PlatformColor("placeholderText")}
                      style={[styles.input, { color: PlatformColor("label") }]}
                      cursorColor={THEME_COLORS.main}
                      selectionColor={THEME_COLORS.main}
                      secureTextEntry={hidePassword}
                    />
                    <TouchableOpacity
                      onPress={() => setHidePassword(!hidePassword)}
                      style={styles.passwordToggle}
                      activeOpacity={0.6}
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
                      style={[styles.errorText, { color: THEME_COLORS.error }]}
                    >
                      {errors.password}
                    </Text>
                  )}
                </View>

                {/* Confirm Password Field */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <Text
                      style={[styles.label, { color: PlatformColor("label") }]}
                    >
                      {i18n.t("form.auth.label.confirmPassword")}
                    </Text>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text
                        style={[
                          styles.errorIndicator,
                          { color: THEME_COLORS.error },
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
                          errors.confirmPassword && touched.confirmPassword
                            ? THEME_COLORS.error
                            : PlatformColor("separator"),
                      },
                    ]}
                  >
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      value={values.confirmPassword}
                      placeholder={i18n.t(
                        "form.auth.placeholder.confirmPassword",
                      )}
                      placeholderTextColor={PlatformColor("placeholderText")}
                      style={[styles.input, { color: PlatformColor("label") }]}
                      cursorColor={THEME_COLORS.main}
                      selectionColor={THEME_COLORS.main}
                      secureTextEntry={hideConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setHideConfirmPassword(!hideConfirmPassword)
                      }
                      style={styles.passwordToggle}
                      activeOpacity={0.6}
                    >
                      <Ionicons
                        name={
                          hideConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={22}
                        color={PlatformColor("secondaryLabel")}
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text
                      style={[styles.errorText, { color: THEME_COLORS.error }]}
                    >
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
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
});
