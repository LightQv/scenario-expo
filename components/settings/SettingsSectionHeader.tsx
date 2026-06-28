import { Text as SwiftText } from "@expo/ui/swift-ui";
import { foregroundStyle } from "@expo/ui/swift-ui/modifiers";
import { TOKENS } from "@/constants/theme";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";

type SettingsSectionHeaderProps = {
  title: string;
};

export default function SettingsSectionHeader({
  title,
}: SettingsSectionHeaderProps) {
  return (
    <SwiftText
      modifiers={[
        settingsRegularFont(TOKENS.font.xl),
        foregroundStyle({ type: "hierarchical", style: "secondary" }),
      ]}
    >
      {title}
    </SwiftText>
  );
}
