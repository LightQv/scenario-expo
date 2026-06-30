import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import HeaderMenu from "@/components/ui/HeaderMenu";

export default function ProfileMenu() {
  const handleEditBanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-banner-edit");
  };

  return (
    <HeaderMenu
      label="Profile actions"
      actions={[
        {
          id: "editBanner",
          title: i18n.t("screen.profile.menu.editBanner"),
          icon: "photo",
          onPress: handleEditBanner,
        },
      ]}
    />
  );
}
