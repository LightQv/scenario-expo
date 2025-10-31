import { StyleSheet, PlatformColor, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONTS } from "@/constants/theme";

type HeaderTitleProps = {
  title: string;
};

export default function HeaderTitle({ title }: HeaderTitleProps) {
  const insets = useSafeAreaInsets();
  return (
    <Text
      style={[
        styles.title,
        { marginTop: -insets.top - 12, color: PlatformColor("label") },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 38,
    fontFamily: FONTS.abril,
    marginBottom: 24,
    paddingHorizontal: 14,
  },
});
