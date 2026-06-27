import { PlatformColor } from "react-native";
import type { ComponentProps } from "react";
import {
  Divider,
  HStack,
  Image,
  Spacer,
  Text as SwiftText,
  Toggle,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  font,
  foregroundStyle,
  frame,
  imageScale,
  lineLimit,
  multilineTextAlignment,
  padding,
  shapes,
  tint,
  toggleStyle,
  truncationMode,
} from "@expo/ui/swift-ui/modifiers";

type NativeDownloadIntegrationCardProps = {
  title: string;
  description: string;
  icon: NonNullable<ComponentProps<typeof Image>["systemName"]>;
  isOn: boolean;
  tintColor: string;
  onIsOnChange: (enabled: boolean) => void;
};

export default function NativeDownloadIntegrationCard({
  title,
  description,
  icon,
  isOn,
  tintColor,
  onIsOnChange,
}: NativeDownloadIntegrationCardProps) {
  return (
    <VStack
      alignment="leading"
      spacing={18}
      modifiers={[
        padding({ all: 2 }),
        background(
          PlatformColor("secondarySystemGroupedBackground"),
          shapes.roundedRectangle({
            cornerRadius: 28,
            roundedCornerStyle: "continuous",
          }),
        ),
      ]}
    >
      <ZStack
        modifiers={[
          frame({ width: 72, height: 72 }),
          background(
            tintColor,
            shapes.roundedRectangle({
              cornerRadius: 16,
              roundedCornerStyle: "continuous",
            }),
          ),
        ]}
      >
        <Image systemName={icon} color="white" modifiers={[imageScale("large")]} />
      </ZStack>

      <VStack alignment="leading" spacing={6}>
        <SwiftText modifiers={[font({ size: 32, weight: "bold" })]}>
          {title}
        </SwiftText>
        <SwiftText
          modifiers={[
            font({ size: 17 }),
            foregroundStyle({ type: "hierarchical", style: "secondary" }),
            lineLimit(3),
            truncationMode("tail"),
            multilineTextAlignment("leading"),
          ]}
        >
          {description}
        </SwiftText>
      </VStack>

      <Divider />

      <HStack alignment="center" spacing={12}>
        <SwiftText modifiers={[font({ size: 17 })]}>{title}</SwiftText>
        <Spacer />
        <Toggle
          isOn={isOn}
          onIsOnChange={onIsOnChange}
          modifiers={[toggleStyle("switch"), tint(tintColor)]}
        />
      </HStack>
    </VStack>
  );
}
