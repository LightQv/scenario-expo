import { Stack, router } from "expo-router";
import i18n from "@/services/i18n";

type GoBackButtonProps = {
  variant?: "back" | "close";
};

export default function GoBackButton({ variant = "back" }: GoBackButtonProps) {
  const iconName = variant === "close" ? "xmark" : "chevron.left";
  const label = i18n.t(
    variant === "close" ? "navigation.actions.close" : "navigation.actions.back",
  );

  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Button
        accessibilityLabel={label}
        icon={iconName as never}
        onPress={() => router.back()}
      >
        {label}
      </Stack.Toolbar.Button>
    </Stack.Toolbar>
  );
}
