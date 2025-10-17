import { StyleSheet, View, useColorScheme } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const GRADIENT_HEIGHT = 80;

export default function GradientTransition() {
  const colorScheme = useColorScheme();

  // Use appropriate background color based on theme
  const backgroundColor = colorScheme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["transparent", backgroundColor]}
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
