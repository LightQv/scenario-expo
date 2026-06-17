import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "@/contexts";

const GRADIENT_HEIGHT = 240;

export default function GradientTransition() {
  const { colors, isDark } = useThemeContext();

  return (
    <View style={styles.container}>
      <LinearGradient
        key={isDark ? "dark" : "light"}
        colors={["transparent", colors.background]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: GRADIENT_HEIGHT,
    marginTop: -GRADIENT_HEIGHT, // Overlap with banner
    zIndex: 1,
  },
  gradient: {
    flex: 1,
  },
});
