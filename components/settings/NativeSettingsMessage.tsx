import { HStack, Image, Text as SwiftText } from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  multilineTextAlignment,
} from "@expo/ui/swift-ui/modifiers";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import { TOKENS } from "@/constants/theme";

type NativeSettingsMessageProps = {
  message: string;
  color: string;
  icon?: boolean;
};

export default function NativeSettingsMessage({
  message,
  color,
  icon = false,
}: NativeSettingsMessageProps) {
  return (
    <HStack alignment="top" spacing={6}>
      {icon ? <Image systemName="exclamationmark.circle" size={13} color={color} /> : null}
      <SwiftText
        modifiers={[
          settingsRegularFont(TOKENS.font.md),
          foregroundStyle(color),
          multilineTextAlignment("leading"),
        ]}
      >
        {message}
      </SwiftText>
    </HStack>
  );
}
