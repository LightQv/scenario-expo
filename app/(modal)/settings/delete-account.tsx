import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useUserContext } from "@/contexts";
import { FONTS, TOKENS, TOAST_COLORS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import SettingsDescriptionCard from "@/components/settings/SettingsDescriptionCard";

export default function DeleteAccountSettingsScreen() {
  const { user, logout } = useUserContext();
  const [usernameConfirmation, setUsernameConfirmation] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const errorColor = isDark
    ? TOAST_COLORS.dark.error
    : TOAST_COLORS.light.error;

  const isDeleteEnabled =
    usernameConfirmation.trim().toLowerCase() ===
    user?.username.trim().toLowerCase();

  const handleDeleteAccount = () => {
    Alert.alert(
      i18n.t("form.profile.delete.account.title"),
      i18n.t("form.profile.delete.account.subtitle"),
      [
        {
          text: i18n.t("form.profile.delete.account.cancel"),
          style: "cancel",
        },
        {
          text: i18n.t("form.profile.delete.account.submit"),
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/v1/users/${user?.id}`, {
                method: "DELETE",
              });
              notifySuccess(i18n.t("toast.success.profile.delete"));
              await logout();
              router.dismissAll();
            } catch (error) {
              console.error("Delete account error:", error);
              notifyError(i18n.t("toast.error"));
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <GoBackButton variant="close" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <SettingsDescriptionCard
              title={i18n.t("screen.settings.deleteAccount.title")}
              description={i18n.t("screen.settings.deleteAccount.description")}
              icon="trash"
            />

            <View style={styles.inputSection}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: PlatformColor(
                      "secondarySystemGroupedBackground",
                    ),
                    borderColor: PlatformColor("separator"),
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: PlatformColor("label"),
                    },
                  ]}
                  value={usernameConfirmation}
                  onChangeText={setUsernameConfirmation}
                  placeholder={i18n.t("form.profile.delete.account.placeholder")}
                  placeholderTextColor={PlatformColor("secondaryLabel")}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <Text
                style={[
                  styles.inputHint,
                  { color: PlatformColor("secondaryLabel") },
                ]}
              >
                {i18n.t("form.profile.delete.account.label1")} {""}
                <Text style={{ color: errorColor }}>{user?.username}</Text>{" "}
                {i18n.t("form.profile.delete.account.label2")}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={[
                styles.deleteButton,
                {
                  backgroundColor: isDeleteEnabled
                    ? errorColor
                    : PlatformColor("secondarySystemGroupedBackground"),
                },
              ]}
              activeOpacity={BUTTON.opacity}
              disabled={!isDeleteEnabled}
            >
              <Text
                style={[
                  styles.deleteButtonText,
                  {
                    color: isDeleteEnabled
                      ? "#fff"
                      : PlatformColor("secondaryLabel"),
                  },
                ]}
              >
                {i18n.t("form.profile.delete.account.submit")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: TOKENS.margin.horizontal,
    paddingTop: TOKENS.modal.paddingTop,
    paddingBottom: 60,
  },
  innerContainer: {
    gap: 28,
  },
  inputSection: {
    gap: 8,
  },
  inputContainer: {
    borderRadius: TOKENS.radius.md,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  input: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    height: "100%",
  },
  inputHint: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    lineHeight: 16,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  deleteButton: {
    height: 52,
    borderRadius: TOKENS.radius.xl,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  deleteButtonText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
});
