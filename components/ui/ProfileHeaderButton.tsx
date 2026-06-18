import { router } from "expo-router";
import { useUserContext } from "@/contexts";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";

export default function ProfileHeaderButton() {
  const { authState, user } = useUserContext();

  const handlePress = () => {
    if (authState.authenticated && user) {
      router.push("/(modal)/account");
    } else {
      router.push("/(modal)/login");
    }
  };

  const isAuthenticated = authState.authenticated && user;

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: "profile",
          label: isAuthenticated ? user.username : "Profile",
          icon: isAuthenticated ? "person.crop.circle.fill" : "person.crop.circle",
          active: Boolean(isAuthenticated),
          onPress: handlePress,
        },
      ]}
    />
  );
}
