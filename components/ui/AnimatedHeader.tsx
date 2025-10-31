import { StyleSheet, View, Text, Animated, PlatformColor } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS } from "@/constants/theme";

type AnimatedHeaderProps = {
  title: string;
  scrollY: Animated.Value;
};

export default function AnimatedHeader({
  title,
  scrollY,
}: AnimatedHeaderProps) {
  const insets = useSafeAreaInsets();

  // Title opacity animation - fades out almost instantly on scroll
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 2, 6],
    outputRange: [1, 0.3, 0],
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
