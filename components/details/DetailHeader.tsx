import { StyleSheet, Text, View, PlatformColor } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { TOKENS, FONTS } from "@/constants/theme";
import i18n from "@/services/i18n";

type DetailHeaderProps = {
  /* Overall type */
  overview?: string;

  /* Person type */
  biography?: string;
  backgroundColor?: string;
  textColor?: string;
};

export default function DetailHeader({
  overview,
  biography,
  backgroundColor,
  textColor,
}: DetailHeaderProps) {
  const { type } = useLocalSearchParams<{ type: string }>();
  const isPerson = type === "person";
  const displayText = isPerson ? biography : overview;

  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, index) => (
      <Text key={index}>
        {line.trim()}
        {index < lines.length - 1 && (
          <Text style={{ lineHeight: 6 }}>{"\n"}</Text>
        )}
      </Text>
    ));
  };

  return (
    <View style={[styles.container, backgroundColor && { backgroundColor }]}>
      {/* Synopsis/Biography Section */}
      <View>
        <Text
          style={[
            styles.synopsisText,
            { color: textColor || PlatformColor("label") },
          ]}
        >
          {renderFormattedText(
            displayText ||
              (isPerson
                ? i18n.t("error.noBiography")
                : i18n.t("error.noSynopsis")),
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: TOKENS.margin.vertical * 2,
    gap: 16,
    backgroundColor: PlatformColor("systemBackground"),
  },
  synopsisText: {
    fontSize: TOKENS.font.xl,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
});
