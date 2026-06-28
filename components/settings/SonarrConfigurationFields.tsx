import { StyleSheet } from "react-native";
import {
  DisclosureGroup,
  HStack,
  Host,
  List,
  Picker,
  Section,
  Spacer,
  Text as SwiftText,
} from "@expo/ui/swift-ui";
import {
  foregroundStyle,
  listStyle,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import NativeSettingsRow from "@/components/settings/NativeSettingsRow";
import SettingsSectionHeader from "@/components/settings/SettingsSectionHeader";
import { settingsRegularFont } from "@/components/settings/nativeSettingsModifiers";
import type {
  SelectOption,
  SonarrConfigurationType,
} from "@/services/downloadSettings";
import i18n from "@/services/i18n";
import {
  getSonarrConfigurationLabel,
  getSonarrConfigurationTag,
} from "@/services/sonarrConfigurations";
import { useState } from "react";
import { TOKENS } from "@/constants/theme";

type PickerValue = string | number;

type SonarrConfigurationFieldsProps = {
  type?: SonarrConfigurationType;
  rootFolderPath?: string | null;
  qualityProfileId?: number | null;
  languageProfileId?: number | null;
  rootOptions: SelectOption[];
  qualityOptions: SelectOption[];
  languageOptions: SelectOption[];
  availableTypes?: SonarrConfigurationType[];
  onTypeChange?: (value: SonarrConfigurationType) => void;
  onRootFolderChange: (value: string) => void;
  onQualityProfileChange: (value: number) => void;
  onLanguageProfileChange: (value: number | null) => void;
  onDelete?: () => void;
  deleteLabel?: string;
};

export default function SonarrConfigurationFields({
  type,
  rootFolderPath,
  qualityProfileId,
  languageProfileId,
  rootOptions,
  qualityOptions,
  languageOptions,
  availableTypes,
  onTypeChange,
  onRootFolderChange,
  onQualityProfileChange,
  onLanguageProfileChange,
  onDelete,
  deleteLabel,
}: SonarrConfigurationFieldsProps) {
  return (
    <Host style={styles.host}>
      <List modifiers={[listStyle("insetGrouped")]}>
        {onTypeChange ? (
          <Section>
            <TypeDisclosurePicker
              value={type}
              options={availableTypes ?? []}
              onSelect={onTypeChange}
            />
          </Section>
        ) : null}

        {type ? (
          <>
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

            <Section
              header={
                <SettingsSectionHeader
                  title={i18n.t("screen.settings.fields.languageProfile")}
                />
              }
            >
              <NativePicker
                value={languageProfileId ?? null}
                options={languageOptions}
                onSelect={(value) => onLanguageProfileChange(Number(value))}
              />
            </Section>

            <Section
              header={
                <SettingsSectionHeader
                  title={i18n.t("screen.settings.fields.tag")}
                />
              }
              footer={
                <SwiftText modifiers={[settingsRegularFont(TOKENS.font.md)]}>
                  {i18n.t("screen.settings.sonarr.tagFooter")}
                </SwiftText>
              }
            >
              <SwiftText
                modifiers={[
                  settingsRegularFont(),
                  foregroundStyle({ type: "hierarchical", style: "secondary" }),
                ]}
              >
                {getSonarrConfigurationTag(type)}
              </SwiftText>
            </Section>

            {onDelete ? (
              <Section>
                <NativeSettingsRow
                  label={
                    deleteLabel ??
                    i18n.t("screen.settings.sonarr.deleteConfiguration.row")
                  }
                  labelColor="red"
                  showChevron={false}
                  onPress={onDelete}
                />
              </Section>
            ) : null}
          </>
        ) : null}
      </List>
    </Host>
  );
}

function TypeDisclosurePicker({
  value,
  options,
  onSelect,
}: {
  value?: SonarrConfigurationType;
  options: SonarrConfigurationType[];
  onSelect: (value: SonarrConfigurationType) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const optionsWithCurrent =
    value && !options.includes(value) ? [value, ...options] : options;

  return (
    <DisclosureGroup isExpanded={isExpanded} onIsExpandedChange={setIsExpanded}>
      <DisclosureGroup.Label>
        <HStack alignment="center" spacing={8}>
          <SwiftText modifiers={[settingsRegularFont()]}>
            {i18n.t("screen.settings.fields.type")}
          </SwiftText>
          <Spacer />
          <SwiftText
            modifiers={[
              settingsRegularFont(),
              foregroundStyle({ type: "hierarchical", style: "secondary" }),
            ]}
          >
            {value
              ? getSonarrConfigurationLabel(value)
              : i18n.t("screen.settings.common.required")}
          </SwiftText>
        </HStack>
      </DisclosureGroup.Label>
      <Picker
        selection={value ?? null}
        onSelectionChange={(next) => {
          if (next) onSelect(next as SonarrConfigurationType);
        }}
        modifiers={[pickerStyle("inline")]}
      >
        {optionsWithCurrent.map((configurationType) => (
          <SwiftText
            key={configurationType}
            modifiers={[settingsRegularFont(), tag(configurationType)]}
          >
            {getSonarrConfigurationLabel(configurationType)}
          </SwiftText>
        ))}
      </Picker>
    </DisclosureGroup>
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
