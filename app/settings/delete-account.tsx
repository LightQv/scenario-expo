import { Alert, PlatformColor, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  Host,
  List,
  Section,
  Text as SwiftText,
  TextField,
  useNativeState,
} from "@expo/ui/swift-ui";
import {
  autocorrectionDisabled,
  foregroundStyle,
  keyboardType,
  listStyle,
  submitLabel,
  textInputAutocapitalization,
} from "@expo/ui/swift-ui/modifiers";
import { useUserContext } from "@/contexts";
import i18n from "@/services/i18n";
import { apiFetch } from "@/services/instances";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import GoBackButton from "@/components/ui/GoBackButton";
import NativeSettingsDescriptionCard from "@/components/settings/NativeSettingsDescriptionCard";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import { TOKENS } from "@/constants/theme";

const destructiveColor = PlatformColor("systemRed") as unknown as string;
const disabledLabelColor = PlatformColor("secondaryLabel") as unknown as string;

export default function DeleteAccountSettingsScreen() {
  const { user, logout } = useUserContext();
  const confirmationText = useNativeState("");
  const [usernameConfirmation, setUsernameConfirmation] = useState("");

  const isDeleteEnabled =
    Boolean(user?.username) &&
    usernameConfirmation.trim().toLowerCase() ===
      user?.username.trim().toLowerCase();

  const handleDeleteAccount = () => {
    if (!isDeleteEnabled) return;

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
    <View style={styles.container}>
      <GoBackButton />
      <Host style={styles.host}>
        <List modifiers={[listStyle("insetGrouped")]}> 
          <Section>
            <NativeSettingsDescriptionCard
              title={i18n.t("screen.settings.deleteAccount.title")}
              description={i18n.t("screen.settings.deleteAccount.description")}
              icon="trash"
              tintColor={destructiveColor}
            />
          </Section>

          <Section footer={<ConfirmationFooter username={user?.username ?? ""} />}>
            <TextField
              text={confirmationText}
              placeholder={i18n.t("form.profile.delete.account.placeholder")}
              onTextChange={setUsernameConfirmation}
              modifiers={[
                autocorrectionDisabled(),
                keyboardType("default"),
                submitLabel("done"),
                textInputAutocapitalization("never"),
              ]}
            />
          </Section>

          <Section>
            <NativeSettingsRow
              label={i18n.t("form.profile.delete.account.submit")}
              labelColor={
                isDeleteEnabled ? destructiveColor : disabledLabelColor
              }
              disabled={!isDeleteEnabled}
              showChevron={false}
              onPress={handleDeleteAccount}
            />
          </Section>
        </List>
      </Host>
    </View>
  );
}

function ConfirmationFooter({ username }: { username: string }) {
  return (
    <SwiftText
      modifiers={[
        foregroundStyle({ type: "hierarchical", style: "secondary" }),
      ]}
    >
      {i18n.t("form.profile.delete.account.label1")} {""}
      <SwiftText modifiers={[foregroundStyle(destructiveColor)]}>
        {username}
      </SwiftText>{" "}
      {i18n.t("form.profile.delete.account.label2")}
    </SwiftText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor("systemGroupedBackground"),
  },
  host: {
    flex: 1,
    paddingTop: TOKENS.modal.paddingTop,
  },
});
