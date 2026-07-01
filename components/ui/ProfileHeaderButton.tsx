import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext, useUserContext } from "@/contexts";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import { BUTTON, FONTS, TOKENS } from "@/constants/theme";
import i18n from "@/services/i18n";

export default function ProfileHeaderButton() {
  const { authState, user } = useUserContext();
  const { colors } = useThemeContext();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (authState.authenticated && user) {
      router.push("/(modal)/account");
    } else {
      router.push("/(modal)/login");
    }
  };

  const isAuthenticated = authState.authenticated && user;

  if (isAuthenticated) {
    return (
      <TouchableOpacity
        activeOpacity={BUTTON.opacity}
        onPress={handlePress}
        style={[
          styles.avatarButton,
          {
            top: insets.top + 6,
            backgroundColor: colors.main,
          },
        ]}
      >
        <Text style={styles.avatarText}>
          {user.username.charAt(0).toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: "profile",
          label: i18n.t("navigation.actions.profile"),
          icon: "person.crop.circle",
          onPress: handlePress,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    position: "absolute",
    right: TOKENS.margin.horizontal,
    zIndex: 100,
    width: 38,
    height: 38,
    borderRadius: TOKENS.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
    lineHeight: 20,
  },
});
