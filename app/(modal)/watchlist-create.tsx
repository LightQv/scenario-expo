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
import { router } from "expo-router";
import { createWatchlistSchema } from "@/services/validators";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useUserContext } from "@/contexts/UserContext";
import { FONTS, TOKENS, THEME_COLORS } from "@/constants/theme";

export default function WatchlistCreateModal() {
  const { user } = useUserContext();
  const [loading, setLoading] = useState(false);

  const handleCreateWatchlist = async (title: string) => {
    if (!user) {
      notifyError(i18n.t("toast.error"));
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/v1/watchlists`, {
        method: "POST",
        body: JSON.stringify({ title: title.trim() }),
      });
      notifySuccess(i18n.t("form.watchlist.success.create"));
      router.back();
    } catch (error) {
      console.error("Error creating watchlist:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
    }
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
          initialValues={{ title: "" }}
          validationSchema={createWatchlistSchema}
          onSubmit={(values) => {
            handleCreateWatchlist(values.title);
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
              {/* Title Field */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelContainer}>
                  <Text
                    style={[styles.label, { color: PlatformColor("label") }]}
                  >
                    {i18n.t("form.watchlist.field.title")}
                  </Text>
                  {errors.title && touched.title && (
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
                        errors.title && touched.title
                          ? THEME_COLORS.error
                          : PlatformColor("separator"),
                    },
                  ]}
                >
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={handleChange("title")}
                    onBlur={handleBlur("title")}
                    value={values.title}
                    placeholder={i18n.t("form.watchlist.placeholder.title")}
                    placeholderTextColor={PlatformColor("placeholderText")}
                    style={[styles.input, { color: PlatformColor("label") }]}
                    cursorColor={THEME_COLORS.main}
                    selectionColor={THEME_COLORS.main}
                    maxLength={50}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit()}
                  />
                </View>
                {errors.title && touched.title && (
                  <Text
                    style={[styles.errorText, { color: THEME_COLORS.error }]}
                  >
                    {errors.title}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                disabled={!createWatchlistSchema.isValidSync(values) || loading}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      !createWatchlistSchema.isValidSync(values) || loading
                        ? PlatformColor("systemGray4")
                        : THEME_COLORS.main,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    {
                      color:
                        !createWatchlistSchema.isValidSync(values) || loading
                          ? PlatformColor("systemGray")
                          : "#fff",
                    },
                  ]}
                >
                  {loading
                    ? i18n.t("form.auth.submit.loading")
                    : i18n.t("form.watchlist.submit.create")}
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
});
