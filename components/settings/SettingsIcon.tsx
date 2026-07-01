import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { useThemeContext } from "@/contexts";

type SettingsIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  colors?: [string, string];
  size?: "sm" | "lg";
};

export default function SettingsIcon({
  name,
  colors,
  size = "sm",
}: SettingsIconProps) {
  const { colors: themeColors } = useThemeContext();
  const glyphSize = size === "lg" ? 34 : 20;
  const iconColors = colors ?? [themeColors.main, themeColors.main];

  return (
    <LinearGradient
      colors={iconColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        size === "lg" ? styles.containerLg : styles.containerSm,
      ]}
    >
      <View style={styles.highlight} />
      <Ionicons name={name} size={glyphSize} color="#fff" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 2,
    elevation: 2,
  },
  containerSm: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  containerLg: {
    width: 58,
    height: 58,
    borderRadius: 15,
  },
  highlight: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    height: "45%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
});
