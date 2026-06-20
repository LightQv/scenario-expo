import { Stack } from "expo-router";

export type HeaderMenuItem = {
  id: string;
  title: string;
  icon?: string;
  selected?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  displayInline?: boolean;
  onPress?: () => void;
  children?: HeaderMenuItem[];
};

export type HeaderCapsuleAction = {
  id: string;
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
  menu?: HeaderMenuItem[];
};

type HeaderActionCapsuleProps = {
  actions: HeaderCapsuleAction[];
};

export default function HeaderActionCapsule({
  actions,
}: HeaderActionCapsuleProps) {
  return (
    <Stack.Toolbar placement="right">
      {actions.map((action) => {
        if (action.menu?.length) {
          return (
            <Stack.Toolbar.Menu
              key={action.id}
              accessibilityLabel={action.label}
              icon={action.icon as never}
              title={action.label}
            >
              {renderMenuItems(action.menu)}
            </Stack.Toolbar.Menu>
          );
        }

        return (
          <Stack.Toolbar.Button
            key={action.id}
            accessibilityLabel={action.label}
            icon={action.icon as never}
            onPress={action.onPress}
            selected={action.active}
          >
            {action.label}
          </Stack.Toolbar.Button>
        );
      })}
    </Stack.Toolbar>
  );
}

function renderMenuItems(items: HeaderMenuItem[]) {
  return items.map((item) => {
    if (item.children?.length) {
      return (
        <Stack.Toolbar.Menu
          key={item.id}
          destructive={item.destructive}
          icon={item.icon as never}
          inline={item.displayInline}
          title={item.title}
        >
          {renderMenuItems(item.children)}
        </Stack.Toolbar.Menu>
      );
    }

    return (
      <Stack.Toolbar.MenuAction
        key={item.id}
        destructive={item.destructive}
        icon={item.icon as never}
        isOn={item.selected}
        disabled={item.disabled}
        onPress={item.disabled ? undefined : item.onPress}
      >
        {item.title}
      </Stack.Toolbar.MenuAction>
    );
  });
}
