import { useMemo } from "react";
import { useViewContext } from "@/contexts/ViewContext";

/**
 * Hook to check if a media item is viewed and get the view object
 * @param tmdbId - TMDB ID of the media
 * @param mediaType - Type of media ('movie' or 'tv')
 * @returns Object with viewed status and view object
 */
export default function useView(tmdbId: number, mediaType: string) {
  const { isViewed, getViewByTmdbId } = useViewContext();

  const result = useMemo(() => {
    const viewed = isViewed(tmdbId, mediaType);
    const viewObj = getViewByTmdbId(tmdbId, mediaType);

    return { viewed, viewObj };
  }, [tmdbId, mediaType, isViewed, getViewByTmdbId]);

  return result;
}
