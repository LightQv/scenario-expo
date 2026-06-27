import { PlatformColor } from "react-native";
import type { ComponentProps } from "react";
import {
  Button,
  HStack,
  Image,
  Spacer,
  Text as SwiftText,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  disabled as disabledModifier,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

type NativeSettingsRowProps = {
  label: string;
  value?: string;
  labelColor?: string;
  systemIcon?: NonNullable<ComponentProps<typeof Image>["systemName"]>;
  tintColor?: string;
  showChevron?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

export default function NativeSettingsRow({
  label,
  value,
  labelColor,
  systemIcon,
  tintColor,
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
        padding({ all: systemIcon ? 0 : 2 }),
      ]}
    >
      <HStack alignment="center" spacing={8}>
        {systemIcon ? (
          <ZStack
            modifiers={[
              frame({ width: 28, height: 28 }),
              background(
                tintColor as string,
                shapes.roundedRectangle({
                  cornerRadius: 8,
                  roundedCornerStyle: "continuous",
                }),
              ),
            ]}
          >
            <Image systemName={systemIcon} color="white" size={14} />
          </ZStack>
        ) : null}
        <SwiftText
          modifiers={[
            ...(labelColor ? [foregroundStyle(labelColor)] : []),
            ...(systemIcon ? [padding({ leading: 4 })] : []),
          ]}
        >
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
