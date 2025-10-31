import { StyleSheet, View } from "react-native";
import { Button, ContextMenu, Host, Image } from "@expo/ui/swift-ui";
import * as Haptics from "expo-haptics";
import { buttonStyle } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import { useThemeContext } from "@/contexts/ThemeContext";

/**
 * Profile menu component for header right
 * Context menu with Edit Banner and Edit Profile options
 */
export default function ProfileMenu() {
  const { colors } = useThemeContext();

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
      <ContextMenu modifiers={[buttonStyle("glass")]}>
        <ContextMenu.Items>
          <Button onPress={handleEditBanner} systemImage="photo">
            {i18n.t("screen.profile.menu.editBanner")}
          </Button>
          <Button onPress={handleEditProfile} systemImage="square.and.pencil">
            {i18n.t("screen.profile.menu.editProfile")}
          </Button>
        </ContextMenu.Items>
        <ContextMenu.Trigger>
          <View>
            <Host style={{ width: 14, height: 22 }}>
              <Image systemName="ellipsis" color={colors.text} />
            </Host>
          </View>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 34,
    width: 28,
  },
});
