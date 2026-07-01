import { PlatformColor } from "react-native";
import {
  Button,
  HStack,
  Spacer,
  Text as SwiftText,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  disabled as disabledModifier,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import {
  settingsBoldFont,
  settingsRegularFont,
} from "@/components/settings/nativeSettingsModifiers";
import NativeSettingsMessage from "@/components/settings/NativeSettingsMessage";
import { TOKENS } from "@/constants/theme";

type AuthFooterLinkProps = {
  text: string;
  actionText?: string;
  alignment: "right" | "center";
  tintColor: string;
  onPress: () => void;
};

export function AuthFooterLink({
  text,
  actionText,
  alignment,
  tintColor,
  onPress,
}: AuthFooterLinkProps) {
  const content = (
    <HStack alignment="center" spacing={4}>
      <SwiftText
        modifiers={[
          settingsRegularFont(TOKENS.font.md),
          foregroundStyle(
            actionText
              ? { type: "hierarchical", style: "secondary" }
              : tintColor,
          ),
          multilineTextAlignment(alignment === "center" ? "center" : "trailing"),
        ]}
      >
        {text}
      </SwiftText>
      {actionText ? (
        <SwiftText
          modifiers={[
            settingsBoldFont(TOKENS.font.md),
            foregroundStyle(tintColor),
            multilineTextAlignment("center"),
          ]}
        >
          {actionText}
        </SwiftText>
      ) : null}
    </HStack>
  );

  return (
    <Button onPress={onPress} modifiers={[buttonStyle("plain")]}> 
      <HStack>
        {alignment === "right" ? <Spacer /> : null}
        {alignment === "center" ? <Spacer /> : null}
        {content}
        {alignment === "center" ? <Spacer /> : null}
      </HStack>
    </Button>
  );
}

export { NativeSettingsMessage as AuthMessage };

type AuthSubmitRowProps = {
  label: string;
  disabled: boolean;
  tintColor: string;
  onPress: () => void;
};

export function AuthSubmitRow({
  label,
  disabled,
  tintColor,
  onPress,
}: AuthSubmitRowProps) {
  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle("plain"),
        disabledModifier(disabled),
        padding({ all: 2 }),
      ]}
    >
      <HStack alignment="center" spacing={8}>
        <SwiftText
          modifiers={[
            settingsRegularFont(),
            foregroundStyle(disabled ? PlatformColor("tertiaryLabel") : tintColor),
          ]}
        >
          {label}
        </SwiftText>
        <Spacer />
      </HStack>
    </Button>
  );
}

type AuthDescriptionProps = {
  text: string;
};

export function AuthDescription({ text }: AuthDescriptionProps) {
  return (
    <VStack alignment="leading" spacing={0}>
      <SwiftText
        modifiers={[
          settingsRegularFont(TOKENS.font.lg),
          foregroundStyle({ type: "hierarchical", style: "secondary" }),
          multilineTextAlignment("leading"),
        ]}
      >
        {text}
      </SwiftText>
    </VStack>
  );
}
