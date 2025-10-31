import {
  StyleSheet,
  View,
  Text,
  PlatformColor,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { apiFetch, tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useUserContext } from "@/contexts/UserContext";
import { FONTS, TOKENS, THEME_COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function WatchlistAddModal() {
  const { user } = useUserContext();
  const { tmdbId, mediaType, title } = useLocalSearchParams<{
    tmdbId: string;
    mediaType: string;
    title: string;
  }>();

  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all user watchlists
  useEffect(() => {
    const fetchWatchlists = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await apiFetch(`/api/v1/watchlists/${user.id}`);
        setWatchlists(response);
      } catch (error) {
        console.error("Error fetching watchlists:", error);
        notifyError(i18n.t("toast.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlists();
  }, [user?.id]);

  // Check if media is already in a watchlist
  const isMediaInWatchlist = (watchlist: Watchlist): boolean => {
    return watchlist.medias.some((media) => media.tmdb_id === Number(tmdbId));
  };

  // Handle adding/removing media to/from selected watchlist
  const handleToggleWatchlist = async (targetWatchlistId: string) => {
    if (!tmdbId || !mediaType || !title) {
      notifyError(i18n.t("toast.error"));
      return;
    }

    try {
      setSubmitting(true);

      // Find the target watchlist
      const targetWatchlist = watchlists.find(
        (w) => w.id === targetWatchlistId,
      );

      if (!targetWatchlist) {
        notifyError(i18n.t("toast.error"));
        return;
      }

      // Check if media is already in this watchlist
      const existingMedia = targetWatchlist.medias.find(
        (media) => media.tmdb_id === Number(tmdbId),
      );

      if (existingMedia) {
        // Remove media from watchlist
        await apiFetch(`/api/v1/medias/${existingMedia.id}`, {
          method: "DELETE",
        });

        notifySuccess(i18n.t("screen.watchlist.add.removed"));
      } else {
        // Fetch complete media details from TMDB
        const tmdbData = await tmdbFetch(
          `/${mediaType}/${tmdbId}?language=${i18n.locale}`,
        );

        // Prepare media data according to MediaCreate schema
        const mediaPayload = {
          tmdb_id: Number(tmdbId),
          genre_ids: tmdbData.genres?.map((g: { id: number }) => g.id) || [0],
          poster_path: tmdbData.poster_path || "",
          backdrop_path: tmdbData.backdrop_path || "",
          release_date:
            tmdbData.release_date || tmdbData.first_air_date || "1900-01-01",
          runtime:
            tmdbData.runtime ||
            tmdbData.episode_run_time?.[0] ||
            tmdbData.number_of_episodes ||
            0,
          title: tmdbData.title || tmdbData.name || title,
          media_type: mediaType,
          watchlist_id: targetWatchlistId,
        };

        // Create new media in the selected watchlist
        await apiFetch(`/api/v1/medias`, {
          method: "POST",
          body: JSON.stringify(mediaPayload),
        });

        notifySuccess(i18n.t("screen.watchlist.add.success"));
      }

      // Refresh watchlists to update the checkmarks
      const response = await apiFetch(`/api/v1/watchlists/${user?.id}`);
      setWatchlists(response);
    } catch (error) {
      console.error("Error toggling media in watchlist:", error);
      notifyError(i18n.t("toast.error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLORS.main} />
      </View>
    );
  }

  // Sort by title
  const sortedWatchlists = [...watchlists].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text
        style={[styles.subtitle, { color: PlatformColor("secondaryLabel") }]}
      >
        {i18n.t("screen.watchlist.add.subtitle")}
      </Text>

      <View style={styles.listContainer}>
        {sortedWatchlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                { color: PlatformColor("secondaryLabel") },
              ]}
            >
              {i18n.t("screen.watchlist.empty")}
            </Text>
          </View>
        ) : (
          sortedWatchlists.map((watchlist) => {
            const alreadyIn = isMediaInWatchlist(watchlist);
            const disabled = submitting;

            return (
              <TouchableOpacity
                key={watchlist.id}
                style={[
                  styles.watchlistItem,
                  {
                    backgroundColor: PlatformColor("secondarySystemBackground"),
                  },
                ]}
                onPress={() => handleToggleWatchlist(watchlist.id)}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <View style={styles.watchlistContent}>
                  <Text
                    style={[
                      styles.watchlistTitle,
                      { color: PlatformColor("label") },
                    ]}
                    numberOfLines={1}
                  >
                    {watchlist.title}
                  </Text>
                  <Text
                    style={[
                      styles.watchlistCount,
                      { color: PlatformColor("secondaryLabel") },
                    ]}
                  >
                    {watchlist.medias_count}{" "}
                    {watchlist.medias_count === 1
                      ? i18n.t("screen.watchlist.count.singular")
                      : i18n.t("screen.watchlist.count.plurial")}
                  </Text>
                </View>

                {alreadyIn && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={THEME_COLORS.main}
                  />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: TOKENS.margin.horizontal,
    paddingHorizontal: TOKENS.margin.horizontal,
    paddingBottom: TOKENS.margin.horizontal * 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    marginBottom: 20,
  },
  listContainer: {
    gap: 12,
  },
  watchlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: TOKENS.radius.md,
  },
  watchlistContent: {
    flex: 1,
    gap: 4,
  },
  watchlistTitle: {
    fontFamily: FONTS.bold,
    fontSize: TOKENS.font.xxl,
  },
  watchlistCount: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.md,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: TOKENS.font.lg,
    textAlign: "center",
  },
});
