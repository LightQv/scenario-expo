import { Ionicons } from "@expo/vector-icons";
import {
  PlatformColor,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import SettingsIcon from "@/components/settings/SettingsIcon";

type SettingsNavigationRowProps = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColors?: [string, string];
  value?: string;
  destructive?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
  showChevron?: boolean;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  labelColor?: string;
  onPress?: () => void;
};

export default function SettingsNavigationRow({
  label,
  icon,
  iconColors,
  value,
  destructive = false,
  disabled = false,
  showDivider = false,
  showChevron = true,
  trailingIcon,
  labelColor,
  onPress,
}: SettingsNavigationRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.touchable}
      activeOpacity={BUTTON.opacity}
      disabled={disabled || !onPress}
    >
      <View style={styles.row}>
        {icon ? (
          <SettingsIcon name={icon} colors={iconColors} />
        ) : null}
        <View style={styles.content}>
          <View style={styles.contentRow}>
            <Text
              style={[
                styles.label,
                {
                  color: labelColor
                    ? labelColor
                    : destructive
                    ? PlatformColor("systemRed")
                    : disabled
                      ? PlatformColor("tertiaryLabel")
                      : PlatformColor("label"),
                },
              ]}
            >
              {label}
            </Text>
            <View style={styles.trailing}>
              {value ? (
                <Text
                  style={[
                    styles.value,
                    { color: PlatformColor("secondaryLabel") },
                  ]}
                  numberOfLines={1}
                >
                  {value}
                </Text>
              ) : null}
              {onPress && trailingIcon ? (
                <Ionicons
                  name={trailingIcon}
                  size={24}
                  color={PlatformColor("systemBlue")}
                />
              ) : null}
              {onPress && showChevron && !trailingIcon ? (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={PlatformColor("tertiaryLabel")}
                />
              ) : null}
            </View>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    minHeight: 50,
  },
  row: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    flexShrink: 0,
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    flexShrink: 1,
    maxWidth: "68%",
  },
  value: {
    flexShrink: 1,
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.xxl,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
