import { Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS } from "@/constants/theme";
import { Host, Image } from "@expo/ui/swift-ui";

export default function ProfileHeaderButton() {
  const { authState, user } = useUserContext();
  const { colors } = useThemeContext();

  const handlePress = () => {
    if (authState.authenticated && user) {
      router.push("/(modal)/account");
    } else {
      router.push("/(modal)/login");
    }
  };

  const isAuthenticated = authState.authenticated && user;

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.button,
        isAuthenticated && { backgroundColor: colors.main },
      ]}
      hitSlop={10}
    >
      {isAuthenticated ? (
        <Text style={styles.avatarText}>
          {user.username.charAt(0).toUpperCase()}
        </Text>
      ) : (
        <Host>
          <Image systemName="person.crop.circle" />
        </Host>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  avatarText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
});
