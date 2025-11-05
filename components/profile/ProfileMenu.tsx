import { StyleSheet } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";

export default function ProfileMenu() {
  const handleEditBanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-banner-edit");
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-edit");
  };

  return (
    <Host style={styles.container}>
      <ContextMenu modifiers={[buttonStyle("plain")]}>
        <ContextMenu.Items>
          <Button onPress={handleEditBanner} systemImage="photo">
            {i18n.t("screen.profile.menu.editBanner")}
          </Button>
          <Button onPress={handleEditProfile} systemImage="square.and.pencil">
            {i18n.t("screen.profile.menu.editProfile")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <Image systemName="ellipsis" />
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 26,
    width: 20,
    marginLeft: 8,
  },
});
