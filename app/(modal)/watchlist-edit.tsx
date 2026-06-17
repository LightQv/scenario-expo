import {
  StyleSheet,
  View,
  Text,
  TextInput,
  PlatformColor,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { Formik } from "formik";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { updateWatchlistSchema } from "@/services/validators";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import { useThemeContext } from "@/contexts";
import { FONTS, TOKENS } from "@/constants/theme";
import FormSubmitHeaderButton from "@/components/ui/FormSubmitHeaderButton";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

export default function WatchlistEditModal() {
  const { colors } = useThemeContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [initialTitle, setInitialTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, [id]);

  const fetchWatchlist = async () => {
    try {
      setFetching(true);
      const response = await apiFetch(`/api/v1/watchlists/detail/${id}`);
      setInitialTitle(response.title);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      notifyError(i18n.t("toast.error"));
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const handleUpdateWatchlist = async (title: string) => {
    try {
      setLoading(true);
      await apiFetch(`/api/v1/watchlists/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title: title.trim() }),
      });
      router.back();
    } catch (error) {
      console.error("Error updating watchlist:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <FullScreenLoader />;
  }

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
          initialValues={{ title: initialTitle }}
          validationSchema={updateWatchlistSchema}
          enableReinitialize
          onSubmit={(values) => {
            handleUpdateWatchlist(values.title);
          }}
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
                      // Touch field to show validation errors
                      setFieldTouched("title", true);
                      formikSubmit();
                    }}
                    disabled={
                      !updateWatchlistSchema.isValidSync(values) || loading
                    }
                  />
                ),
              });
            }, [navigation, values, loading]);

            return (
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
                        style={[styles.errorIndicator, { color: colors.error }]}
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
                            ? colors.error
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
                      cursorColor={colors.main}
                      selectionColor={colors.main}
                      maxLength={50}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={() => formikSubmit()}
                    />
                  </View>
                  {errors.title && touched.title && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.title}
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
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    marginTop: -4,
  },
});
