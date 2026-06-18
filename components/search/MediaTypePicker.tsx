import { StyleSheet } from "react-native";
import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { frame, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import i18n from "@/services/i18n";

type MediaType = "movie" | "tv" | "person";

type MediaTypePickerProps = {
  selectedType: MediaType;
  onTypeChange: (type: MediaType) => void;
};

const MEDIA_TYPES: MediaType[] = ["movie", "tv", "person"];
const PICKER_HEIGHT = 42;

export default function MediaTypePicker({
  selectedType,
  onTypeChange,
}: MediaTypePickerProps) {
  const options = [
    i18n.t("screen.search.type.movie"),
    i18n.t("screen.search.type.tv"),
    i18n.t("screen.search.type.person"),
  ];

  const selectedIndex = MEDIA_TYPES.indexOf(selectedType);

  const handleSelectionChange = (index: number) => {
    const newType = MEDIA_TYPES[index];
    onTypeChange(newType);
  };

  return (
    <Host style={styles.picker}>
      <Picker
        selection={selectedIndex}
        onSelectionChange={handleSelectionChange}
        modifiers={[pickerStyle("segmented"), frame({ height: PICKER_HEIGHT })]}
      >
        {options.map((option, index) => (
          <Text key={MEDIA_TYPES[index]} modifiers={[tag(index)]}>
            {option}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: PICKER_HEIGHT,
    width: "100%",
    flex: 1,
  },
});
