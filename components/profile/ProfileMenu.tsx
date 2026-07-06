import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import HeaderMenu from "@/components/ui/HeaderMenu";

type ProfileMenuProps = {
  showAllBadges: boolean;
  onToggleAllBadges: () => void;
};

export default function ProfileMenu({
  showAllBadges,
  onToggleAllBadges,
}: ProfileMenuProps) {
  const handleEditBanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-banner-edit");
  };

  const handleToggleAllBadges = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleAllBadges();
  };

  return (
    <HeaderMenu
      label={i18n.t("navigation.actions.profileActions")}
      actions={[
        {
          id: "editBanner",
          title: i18n.t("screen.profile.menu.editBanner"),
          icon: "photo",
          onPress: handleEditBanner,
        },
        {
          id: "showAllBadges",
          title: i18n.t("screen.profile.menu.showAllBadges"),
          icon: "checkmark.circle",
          selected: showAllBadges,
          onPress: handleToggleAllBadges,
        },
      ]}
    />
  );
}
