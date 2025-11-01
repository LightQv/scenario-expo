import {
  StyleSheet,
  Text,
  View,
  PlatformColor,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { FONTS, TOKENS, BUTTON } from "@/constants/theme";
import i18n from "@/services/i18n";

type CrewInfoProps = {
  crew: Crew[];
  mediaType?: string;
};

export default function CrewInfo({ crew, mediaType }: CrewInfoProps) {
  // Find director (only for movies)
  const director = crew.find((member) => member.job === "Director");

  // Find composer (for both movies and TV shows)
  const composer = crew.find(
    (member) =>
      member.job === "Original Music Composer" || member.job === "Composer",
  );

  // Don't render if no crew info to show
  if (!director && !composer) {
    return null;
  }

  return (
    <View style={styles.container}>
      {mediaType === "movie" && director && (
        <View style={styles.crewRow}>
          <Text
            style={[styles.label, { color: PlatformColor("secondaryLabel") }]}
          >
            {i18n.t("screen.detail.crew.director")}
          </Text>
          <Link
            href={{
              pathname: "/details/[id]",
              params: { type: "person", id: director.id.toString() },
            }}
            asChild
            push
          >
            <TouchableOpacity activeOpacity={BUTTON.opacity}>
              <Text style={[styles.name, { color: PlatformColor("label") }]}>
                {director.name}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}

      {composer && (
        <View style={styles.crewRow}>
          <Text
            style={[styles.label, { color: PlatformColor("secondaryLabel") }]}
          >
            {i18n.t("screen.detail.crew.composer")}
          </Text>
          <Link
            href={{
              pathname: "/details/[id]",
              params: { type: "person", id: composer.id.toString() },
            }}
            asChild
            push
          >
            <TouchableOpacity activeOpacity={BUTTON.opacity}>
              <Text style={[styles.name, { color: PlatformColor("label") }]}>
                {composer.name}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: 24,
    gap: 8,
    backgroundColor: PlatformColor("systemBackground"),
  },
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.md,
    minWidth: 80,
  },
  name: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
    flex: 1,
  },
});
