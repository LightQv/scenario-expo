import type { ComponentProps, ReactNode } from "react";
import { PlatformColor } from "react-native";
import {
  Divider,
  Image,
  Text as SwiftText,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  foregroundStyle,
  frame,
  imageScale,
  lineLimit,
  multilineTextAlignment,
  padding,
  shapes,
  truncationMode,
} from "@expo/ui/swift-ui/modifiers";
import {
  settingsBoldFont,
  settingsRegularFont,
} from "@/components/settings/nativeSettingsModifiers";

type NativeSettingsDescriptionCardProps = {
  title: string;
  description: string;
  icon: NonNullable<ComponentProps<typeof Image>["systemName"]>;
  tintColor: string;
  children?: ReactNode;
};

export default function NativeSettingsDescriptionCard({
  title,
  description,
  icon,
  tintColor,
  children,
}: NativeSettingsDescriptionCardProps) {
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
          frame({ width: 56, height: 56 }),
          background(
            tintColor,
            shapes.roundedRectangle({
              cornerRadius: 16,
              roundedCornerStyle: "continuous",
            }),
          ),
        ]}
      >
        <Image
          systemName={icon}
          color="white"
          modifiers={[imageScale("large")]}
        />
      </ZStack>

      <VStack alignment="leading" spacing={6}>
        <SwiftText modifiers={[settingsBoldFont(24)]}>
          {title}
        </SwiftText>
        <SwiftText
          modifiers={[
            settingsRegularFont(16),
            foregroundStyle({ type: "hierarchical", style: "secondary" }),
            lineLimit(4),
            truncationMode("tail"),
            multilineTextAlignment("leading"),
          ]}
        >
          {description}
        </SwiftText>
      </VStack>

      {children ? (
        <>
          <Divider />
          {children}
        </>
      ) : null}
    </VStack>
  );
}
