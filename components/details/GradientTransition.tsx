import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "@/contexts";
import {
  colorWithAlpha,
  getFallbackDetailPalette,
  type DetailPalette,
} from "@/services/detailPalette";

const GRADIENT_HEIGHT = 340;

type GradientTransitionProps = {
  palette?: DetailPalette;
  isDark?: boolean;
};

export default function GradientTransition({
  palette: providedPalette,
  isDark: providedIsDark,
}: GradientTransitionProps) {
  const { isDark: themeIsDark } = useThemeContext();
  const isDark = providedIsDark ?? themeIsDark;
  const palette = providedPalette ?? getFallbackDetailPalette(isDark);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <BlurView
        intensity={isDark ? 45 : 32}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[
          "transparent",
          colorWithAlpha(palette.tint, 0.12),
          colorWithAlpha(palette.tint, 0.42),
          colorWithAlpha(palette.background, 0.86),
          palette.background,
        ]}
        locations={[0, 0.24, 0.52, 0.78, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: GRADIENT_HEIGHT,
    marginTop: -GRADIENT_HEIGHT,
    zIndex: 1,
    overflow: "hidden",
  },
});
