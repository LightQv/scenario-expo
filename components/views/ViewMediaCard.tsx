import { ColorValue } from "react-native";
import { formatFullDate, formatRuntime } from "@/services/utils";
import i18n from "@/services/i18n";
import CompactMediaCard from "@/components/ui/CompactMediaCard";
import ViewMediaCardMenu from "./ViewMediaCardMenu";

type ViewMediaCardProps = {
  data: APIMedia;
  onDelete?: (id: string) => void;
  backgroundColor?: ColorValue;
  textColor?: string;
  secondaryTextColor?: string;
};

export default function ViewMediaCard({
  data,
  onDelete,
  backgroundColor,
  textColor,
  secondaryTextColor,
}: ViewMediaCardProps) {
  const getMetadata = () => {
    if (data.media_type === "movie") {
      return `${formatFullDate(data.release_date)} • ${formatRuntime(data.runtime)}`;
    }
    if (data.media_type === "tv") {
      const episodeLabel =
        data.runtime > 1
          ? i18n.t("screen.detail.media.seasons.episode.plurial")
          : i18n.t("screen.detail.media.seasons.episode.singular");
      return `${formatFullDate(data.release_date)} • ${data.runtime} ${episodeLabel}`;
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
      textRightMargin={0}
      trailingAccessory={
        <ViewMediaCardMenu
          media={data}
          onDelete={onDelete}
          textColor={textColor}
        />
      }
    />
  );
}
