import { PlatformColor, StyleSheet, Text, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";

type SettingsInfoRowProps = {
  label: string;
  value?: string;
  showDivider?: boolean;
  disabled?: boolean;
};

export default function SettingsInfoRow({
  label,
  value,
  showDivider = false,
  disabled = false,
}: SettingsInfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <View style={styles.contentRow}>
          <Text
            style={[
              styles.label,
              {
                color: disabled
                  ? PlatformColor("tertiaryLabel")
                  : PlatformColor("label"),
              },
            ]}
          >
            {label}
          </Text>
          {value ? (
            <Text
              style={[styles.value, { color: PlatformColor("secondaryLabel") }]}
              numberOfLines={1}
            >
              {value}
            </Text>
          ) : null}
        </View>
        {showDivider ? (
          <View
            style={[
              styles.divider,
              { backgroundColor: PlatformColor("separator") },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 50,
    paddingLeft: 16,
  },
  content: {
    flex: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingRight: 14,
    paddingVertical: 11,
  },
  label: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  value: {
    maxWidth: "48%",
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
