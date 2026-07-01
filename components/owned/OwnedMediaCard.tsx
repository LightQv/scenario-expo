import {
  StyleSheet,
  View,
  ColorValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatFullDate, formatRuntime } from "@/services/utils";
import { useThemeContext, useViewContext } from "@/contexts";
import CompactMediaCard from "@/components/ui/CompactMediaCard";

type OwnedMediaCardProps = {
  data: OwnedMedia;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function OwnedMediaCard({
  data,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: OwnedMediaCardProps) {
  const { colors } = useThemeContext();
  const { isViewed } = useViewContext();
  const viewed = isViewed(data.tmdb_id, data.media_type);

  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    return formatFullDate(data.release_date);
  };

  return (
    <CompactMediaCard
      title={data.title}
      subtitle={getMetadata()}
      mediaType={data.media_type}
      tmdbId={data.tmdb_id}
      posterPath={data.poster_path}
      backgroundColor={backgroundColor}
      textColor={textColor}
      secondaryTextColor={secondaryTextColor}
      leadingAccessory={
        viewed ? (
        <View style={styles.viewedIndicator}>
          <Ionicons name="eye" size={11} color={colors.text} />
        </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  viewedIndicator: {
    position: "absolute",
    left: 2,
    top: "50%",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
