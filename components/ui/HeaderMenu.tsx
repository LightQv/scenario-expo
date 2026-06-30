import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";
import i18n from "@/services/i18n";

type HeaderMenuProps = {
  actions: HeaderMenuItem[];
  label?: string;
  icon?: string;
};

export default function HeaderMenu({
  actions,
  label,
  icon = "ellipsis",
}: HeaderMenuProps) {
  const resolvedLabel = label ?? (i18n.t("navigation.actions.menu") as string);

  return (
    <HeaderActionCapsule
      actions={[
        {
          id: resolvedLabel,
          label: resolvedLabel,
          icon,
          menu: actions,
        },
      ]}
    />
  );
}
