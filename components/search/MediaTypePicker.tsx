import { StyleSheet } from "react-native";
import { Host, Picker } from "@expo/ui/swift-ui";
import { GlassView } from "expo-glass-effect";
import i18n from "@/services/i18n";
import { TOKENS } from "@/constants/theme";

type MediaType = "movie" | "tv" | "person";

type MediaTypePickerProps = {
  selectedType: MediaType;
  onTypeChange: (type: MediaType) => void;
};

const MEDIA_TYPES: MediaType[] = ["movie", "tv", "person"];

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

  const handleOptionSelected = ({
    nativeEvent,
  }: {
    nativeEvent: { index: number };
  }) => {
    const newType = MEDIA_TYPES[nativeEvent.index];
    onTypeChange(newType);
  };

  return (
    <GlassView style={styles.glassView}>
      <Host matchContents style={styles.picker}>
        <Picker
          options={options}
          selectedIndex={selectedIndex}
          onOptionSelected={handleOptionSelected}
          variant="segmented"
        />
      </Host>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  glassView: {
    borderRadius: TOKENS.radius.full,
    height: 32,
    width: "auto",
  },
  picker: {
    height: 31,
    flex: 1,
  },
});
