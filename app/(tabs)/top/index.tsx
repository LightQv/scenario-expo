import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  PlatformColor,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/constants/theme";

export default function TopIndexScreen() {
  const insets = useSafeAreaInsets();

  const { background, color } = useTheme();

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <Text
        style={[
          styles.title,
          { marginTop: -insets.top + 6, color: PlatformColor("label") },
        ]}
      >
        Top
      </Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
      <Text style={{ color: PlatformColor("label"), fontSize: 20 }}>TOTO</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 24,
  },
  separator: {
    marginVertical: 2,
    height: 1,
    width: "80%",
  },
});
