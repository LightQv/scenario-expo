import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import i18n from "@/services/i18n";
import HeaderMenu from "@/components/ui/HeaderMenu";
import { useOwnedMediaContext } from "@/contexts";

export default function ProfileMenu() {
  const { syncRadarrOwnedMovies, refreshSyncStatus, syncStatus, isSyncing } =
    useOwnedMediaContext();
  const syncRunning = isSyncing || syncStatus?.status === "running";

  const handleEditBanner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-banner-edit");
  };

  const handleEditProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(modal)/profile-edit");
  };

  const handleSyncOwnedMovies = async () => {
    const latestSyncStatus = await refreshSyncStatus();
    if (isSyncing || latestSyncStatus?.status === "running") return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await syncRadarrOwnedMovies();
    } catch {
      // Error toast is handled by OwnedMediaContext.
    }
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
        {
          id: "editProfile",
          title: i18n.t("screen.profile.menu.editProfile"),
          icon: "square.and.pencil",
          onPress: handleEditProfile,
        },
        {
          id: "syncOwnedMovies",
          title: i18n.t(
            syncRunning
              ? "screen.profile.menu.syncOwnedMoviesRunning"
              : "screen.profile.menu.syncOwnedMovies",
          ),
          icon: "arrow.triangle.2.circlepath",
          disabled: syncRunning,
          onPress: handleSyncOwnedMovies,
        },
      ]}
    />
  );
}
