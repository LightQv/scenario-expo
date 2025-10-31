import { Pressable, PlatformColor, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserContext, useThemeContext } from "@/contexts";
import { FONTS } from "@/constants/theme";

export default function ProfileHeaderButton() {
  const { authState, user } = useUserContext();
  const { colors } = useThemeContext();

  const handlePress = () => {
    if (authState.authenticated && user) {
      // Open account modal when authenticated
      router.push("/(modal)/account");
    } else {
      // Open login modal when not authenticated
      router.push("/(modal)/login");
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.headerButton}>
      {authState.authenticated && user ? (
        <View
          style={[styles.avatarCircle, { backgroundColor: colors.main }]}
        >
          <Text style={styles.avatarText}>
            {user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      ) : (
        <View style={styles.avatarCircle}>
          <Ionicons
            name="person-outline"
            size={16}
            color={PlatformColor("label")}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 4.25,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
