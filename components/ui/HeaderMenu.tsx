import type { HeaderMenuItem } from "@/components/ui/HeaderActionCapsule";
import HeaderActionCapsule from "@/components/ui/HeaderActionCapsule";

type HeaderMenuProps = {
  actions: HeaderMenuItem[];
  label?: string;
  icon?: string;
};

export default function HeaderMenu({
  actions,
  label = "Menu",
  icon = "ellipsis",
}: HeaderMenuProps) {
  return (
    <HeaderActionCapsule
      actions={[
        {
          id: label,
          label,
          icon,
          menu: actions,
        },
      ]}
    />
  );
}
