import { PlatformColor, StyleSheet, Switch, Text, View } from "react-native";
import { FONTS, TOKENS } from "@/constants/theme";
import { useThemeContext } from "@/contexts";

type SettingsSwitchRowProps = {
  label: string;
  value: boolean;
  disabled?: boolean;
  showDivider?: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SettingsSwitchRow({
  label,
  value,
  disabled = false,
  showDivider = false,
  onValueChange,
}: SettingsSwitchRowProps) {
  const { colors } = useThemeContext();

  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <View style={styles.contentRow}>
          <Text style={[styles.label, { color: PlatformColor("label") }]}>{label}</Text>
          <Switch
            value={value}
            disabled={disabled}
            onValueChange={onValueChange}
            trackColor={{ true: colors.main }}
          />
        </View>
        {showDivider ? <View style={[styles.divider, { backgroundColor: PlatformColor("separator") }]} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 50, paddingLeft: 16 },
  content: { flex: 1, minHeight: 50, justifyContent: "center" },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingRight: 14,
    paddingVertical: 7,
  },
  label: { flex: 1, fontFamily: FONTS.regular, fontSize: TOKENS.font.xxl },
  divider: { height: StyleSheet.hairlineWidth },
});
