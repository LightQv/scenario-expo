import { StyleSheet, View } from "react-native";
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 39,
  },
  glassView: {
    borderRadius: TOKENS.radius.full,
    marginHorizontal: TOKENS.margin.horizontal,
  },
  picker: {
    paddingHorizontal: TOKENS.margin.horizontal,
    height: 39,
  },
});
