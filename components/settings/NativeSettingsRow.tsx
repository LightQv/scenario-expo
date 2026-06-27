import { PlatformColor } from "react-native";
import {
  Button,
  HStack,
  Image,
  Spacer,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  disabled as disabledModifier,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";

type NativeSettingsRowProps = {
  label: string;
  value?: string;
  labelColor?: string;
  showChevron?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export default function NativeSettingsRow({
  label,
  value,
  labelColor,
  showChevron,
  disabled = false,
  onPress,
}: NativeSettingsRowProps) {
  const hasChevron = showChevron ?? Boolean(onPress);

  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle("plain"),
        disabledModifier(disabled || !onPress),
        padding({ all: 2 }),
      ]}
    >
      <HStack alignment="center" spacing={8}>
        <SwiftText modifiers={labelColor ? [foregroundStyle(labelColor)] : []}>
          {label}
        </SwiftText>
        <Spacer />
        {value ? (
          <SwiftText
            modifiers={[
              foregroundStyle({ type: "hierarchical", style: "secondary" }),
            ]}
          >
            {value}
          </SwiftText>
        ) : null}
        {hasChevron ? (
          <Image
            systemName="chevron.right"
            size={14}
            color={PlatformColor("tertiaryLabel")}
          />
        ) : null}
      </HStack>
    </Button>
  );
}
