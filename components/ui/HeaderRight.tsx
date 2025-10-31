import { View, StyleSheet } from "react-native";
import { TOKENS } from "@/constants/theme";

type HeaderRightProps = {
  children: React.ReactNode;
};

/**
 * Wrapper component for header right content with multiple buttons/icons
 * Provides consistent spacing (22px gap) and alignment
 */
export default function HeaderRight({ children }: HeaderRightProps) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: TOKENS.header.gap,
    marginHorizontal: 8,
    alignItems: "center",
  },
});
