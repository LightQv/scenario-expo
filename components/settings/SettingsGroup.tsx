import { PropsWithChildren } from "react";
import { PlatformColor, StyleSheet, Text, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";

type SettingsGroupProps = PropsWithChildren<{
  title?: string;
  footer?: string;
}>;

export default function SettingsGroup({
  title,
  footer,
  children,
}: SettingsGroupProps) {
  return (
    <View style={styles.wrapper}>
      {title ? (
        <Text style={[styles.title, { color: PlatformColor("label") }]}> 
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.container,
          { backgroundColor: PlatformColor("secondarySystemGroupedBackground") },
        ]}
      >
        {children}
      </View>
      {footer ? (
        <Text style={[styles.footer, { color: PlatformColor("secondaryLabel") }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.lg,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  container: {
    borderRadius: TOKENS.radius.xl,
    overflow: "hidden",
  },
  footer: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.sm,
    lineHeight: 16,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
});
