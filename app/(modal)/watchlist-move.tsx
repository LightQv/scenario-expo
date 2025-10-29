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
import { router, useLocalSearchParams } from "expo-router";
import { apiFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError, notifySuccess } from "@/components/toasts/Toast";
import { useUserContext } from "@/contexts/UserContext";
import { FONTS, TOKENS, THEME_COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function WatchlistMoveModal() {
  const { user } = useUserContext();
  const { mediaId, tmdbId, currentWatchlistId } = useLocalSearchParams<{
    mediaId: string;
    tmdbId: string;
    currentWatchlistId: string;
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

  // Handle moving media to selected watchlist
  const handleMoveToWatchlist = async (targetWatchlistId: string) => {
    if (!mediaId) {
      notifyError(i18n.t("toast.error"));
      return;
    }

    try {
      setSubmitting(true);

      // Update media's watchlist with single PATCH call
      await apiFetch(`/api/v1/medias/${mediaId}`, {
        method: "PUT",
        body: JSON.stringify({ watchlist_id: targetWatchlistId }),
      });

      notifySuccess(i18n.t("form.watchlist.success.update"));
      router.back();
    } catch (error) {
      console.error("Error moving media:", error);
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

  // Filter out current watchlist and sort by title
  const availableWatchlists = watchlists
    .filter((w) => w.id !== currentWatchlistId)
    .sort((a, b) => a.title.localeCompare(b.title));

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
        {i18n.t("screen.watchlist.move.subtitle")}
      </Text>

      <View style={styles.listContainer}>
        {availableWatchlists.length === 0 ? (
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
          availableWatchlists.map((watchlist) => {
            const alreadyIn = isMediaInWatchlist(watchlist);
            const disabled = alreadyIn || submitting;

            return (
              <TouchableOpacity
                key={watchlist.id}
                style={[
                  styles.watchlistItem,
                  {
                    backgroundColor: PlatformColor("secondarySystemBackground"),
                  },
                ]}
                onPress={() => handleMoveToWatchlist(watchlist.id)}
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
    padding: TOKENS.margin.horizontal,
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
