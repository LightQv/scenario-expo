import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  PlatformColor,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { TOKENS, FONTS } from "@/constants/theme";

export default function WatchlistEditModal() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, [id]);

  const fetchWatchlist = async () => {
    try {
      setFetching(true);
      const response = await apiFetch(`/api/v1/watchlists/${id}`);
      setTitle(response.title);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      notifyError(i18n.t("toast.error"));
      router.back();
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      notifyError(i18n.t("form.watchlist.error.title"));
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/v1/watchlists/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: title.trim() }),
      });
      notifySuccess(i18n.t("form.watchlist.success.update"));
      router.back();
    } catch (error) {
      console.error("Error updating watchlist:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={PlatformColor("label") as any} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: PlatformColor("label") }]}>
            {i18n.t("form.watchlist.title.update")}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: PlatformColor("systemBlue") }]}>
              {i18n.t("form.watchlist.cancel")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: PlatformColor("label") }]}>
            {i18n.t("form.watchlist.field.title")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: PlatformColor("systemGray6"),
                color: PlatformColor("label"),
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={i18n.t("form.watchlist.placeholder.title")}
            placeholderTextColor={PlatformColor("placeholderText") as any}
            maxLength={255}
            autoFocus
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: PlatformColor("systemBlue") },
            ]}
            onPress={handleSubmit}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {i18n.t("form.watchlist.submit.update")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  cancelText: {
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.medium,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: TOKENS.font.lg,
    fontFamily: FONTS.medium,
    marginBottom: -8,
  },
  input: {
    height: 48,
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 16,
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.regular,
  },
  submitButton: {
    height: 50,
    borderRadius: TOKENS.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  submitText: {
    color: "#fff",
    fontSize: TOKENS.font.xxl,
    fontFamily: FONTS.bold,
  },
});
