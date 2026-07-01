import { StyleSheet, View, Text, Animated, PlatformColor } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS } from "@/constants/theme";

type AnimatedHeaderProps = {
  title: string;
  scrollY: Animated.Value;
  scrollBaseline?: Animated.Value;
};

export default function AnimatedHeader({
  title,
  scrollY,
  scrollBaseline,
}: AnimatedHeaderProps) {
  const insets = useSafeAreaInsets();

  const scrollDistance = scrollBaseline
    ? Animated.subtract(scrollY, scrollBaseline)
    : scrollY;

  // Fade from distance to the screen's top offset, not accumulated movement.
  const titleOpacity = scrollDistance.interpolate({
    inputRange: [0, 4, 12],
    outputRange: [1, 0.45, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 2,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.titleContainer,
          {
            opacity: titleOpacity,
          },
        ]}
      >
        <Text style={[styles.title, { color: PlatformColor("label") }]}>
          {title}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  titleContainer: {
    marginTop: -8,
  },
  title: {
    fontSize: 38,
    fontFamily: FONTS.abril,
  },
});
