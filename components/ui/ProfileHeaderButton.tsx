import { Pressable, PlatformColor, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS } from "@/constants/theme";

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
        styles.headerButton,
        isAuthenticated && {
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.main,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {isAuthenticated ? (
        <Text style={styles.avatarText}>
          {user.username.charAt(0).toUpperCase()}
        </Text>
      ) : (
        <Ionicons
          name="person-circle-outline"
          size={24}
          color={PlatformColor("label")}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 4.25,
    overflow: "visible",
  },
  avatarText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
