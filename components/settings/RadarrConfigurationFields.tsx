import { StyleSheet } from "react-native";
import {
  Host,
  List,
  Picker,
  Section,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import {
  listStyle,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import type { SelectOption } from "@/services/downloadSettings";
import i18n from "@/services/i18n";

type PickerValue = string | number;

type RadarrConfigurationFieldsProps = {
  rootFolderPath?: string | null;
  qualityProfileId?: number | null;
  rootOptions: SelectOption[];
  qualityOptions: SelectOption[];
  onRootFolderChange: (value: string) => void;
  onQualityProfileChange: (value: number) => void;
  onDelete?: () => void;
  deleteLabel?: string;
};

export default function RadarrConfigurationFields({
  rootFolderPath,
  qualityProfileId,
  rootOptions,
  qualityOptions,
  onRootFolderChange,
  onQualityProfileChange,
  onDelete,
  deleteLabel,
}: RadarrConfigurationFieldsProps) {
  return (
    <Host style={styles.host}>
      <List modifiers={[listStyle("insetGrouped")]}>
        <Section
          header={
            <SettingsSectionHeader
              title={i18n.t("screen.settings.fields.rootFolder")}
            />
          }
        >
          <NativePicker
            value={rootFolderPath ?? null}
            options={rootOptions}
            onSelect={(value) => onRootFolderChange(String(value))}
          />
        </Section>

        <Section
          header={
            <SettingsSectionHeader
              title={i18n.t("screen.settings.fields.qualityProfile")}
            />
          }
        >
          <NativePicker
            value={qualityProfileId ?? null}
            options={qualityOptions}
            onSelect={(value) => onQualityProfileChange(Number(value))}
          />
        </Section>

        {onDelete ? (
          <Section>
            <NativeSettingsRow
              label={deleteLabel ?? i18n.t("screen.settings.radarr.deleteConfiguration.row")}
              labelColor="red"
              showChevron={false}
              onPress={onDelete}
            />
          </Section>
        ) : null}
      </List>
    </Host>
  );
}

function NativePicker({
  value,
  options,
  onSelect,
}: {
  value: PickerValue | null;
  options: SelectOption[];
  onSelect: (value: PickerValue) => void;
}) {
  const pickerOptions = options.filter(
    (option): option is SelectOption & { value: PickerValue } =>
      typeof option.value === "string" || typeof option.value === "number",
  );
  const optionValue = pickerOptions.some((option) => option.value === value)
    ? value
    : null;
  const optionsWithCurrent =
    value !== null && optionValue === null
      ? [{ label: `${value}`, value }, ...pickerOptions]
      : pickerOptions;

  return (
    <Picker
      selection={optionValue}
      onSelectionChange={(next) => {
        if (next !== null) onSelect(next);
      }}
      modifiers={[pickerStyle("inline")]}
    >
      {optionsWithCurrent.map((option) => (
        <SwiftText
          key={`${option.value}`}
          modifiers={[settingsRegularFont(), tag(option.value)]}
        >
          {option.label}
        </SwiftText>
      ))}
    </Picker>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
});
