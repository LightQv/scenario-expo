import { PlatformColor, StyleSheet, Text } from "react-native";
import { FONTS } from "@/constants/theme";

type SettingsPageTitleProps = {
  title: string;
};

export default function SettingsPageTitle({ title }: SettingsPageTitleProps) {
  return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: PlatformColor("label"),
    fontFamily: FONTS.abril,
    fontSize: 38,
  },
});
