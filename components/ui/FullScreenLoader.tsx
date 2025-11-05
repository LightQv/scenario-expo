import {
  StyleSheet,
  View,
  ActivityIndicator,
  PlatformColor,
  Dimensions,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type FullScreenLoaderProps = {
  color?: string;
  size?: "small" | "large";
};

export default function FullScreenLoader({
  color,
  size = "large",
}: FullScreenLoaderProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <ActivityIndicator
        size={size}
        color={color || (PlatformColor("label") as any)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
});
