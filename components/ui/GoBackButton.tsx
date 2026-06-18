import { Stack, router } from "expo-router";

type GoBackButtonProps = {
  variant?: "back" | "close";
};

export default function GoBackButton({ variant = "back" }: GoBackButtonProps) {
  const iconName = variant === "close" ? "xmark" : "chevron.left";
  const label = variant === "close" ? "Close" : "Back";

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
