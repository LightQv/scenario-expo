import { View, StyleSheet } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useThemeContext, useUserContext } from "@/contexts";
import { apiFetch } from "@/services/instances";
import { notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import ProfileBanner from "@/components/profile/ProfileBanner";
import StatisticsPills from "@/components/profile/StatisticsPills";
import ProfileMenu from "@/components/profile/ProfileMenu";
import GoBackButton from "@/components/ui/GoBackButton";

type Statistics = {
  movieCount: number;
  tvCount: number;
  movieRuntime: number;
  tvEpisodesCount: number;
};

export default function ProfileScreen() {
  const { colors, isDark } = useThemeContext();
  const { user, refreshUser } = useUserContext();
  const [statistics, setStatistics] = useState<Statistics>({
    movieCount: 0,
    tvCount: 0,
    movieRuntime: 0,
    tvEpisodesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch movie count
      const movieCountData = await apiFetch(
        `/api/v1/statistics/count/movie/${user.id}`,
      );
      const movieCount =
        movieCountData.length > 0 ? movieCountData[0].count : 0;

      // Fetch TV count
      const tvCountData = await apiFetch(
        `/api/v1/statistics/count/tv/${user.id}`,
      );
      const tvCount = tvCountData.length > 0 ? tvCountData[0].count : 0;

      // Fetch movie runtime
      const movieRuntimeData = await apiFetch(
        `/api/v1/statistics/runtime/movie/${user.id}`,
      );
      const movieRuntime = movieRuntimeData.reduce(
        (total: number, item: { runtime: number }) => total + item.runtime,
        0,
      );

      // Fetch TV episodes count (same as runtime count for TV)
      const tvRuntimeData = await apiFetch(
        `/api/v1/statistics/runtime/tv/${user.id}`,
      );
      const tvEpisodesCount = tvRuntimeData.length;

      setStatistics({
        movieCount,
        tvCount,
        movieRuntime,
        tvEpisodesCount,
      });
      setLoading(false);
    } catch (error) {
      notifyError(i18n.t("toast.error"));
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Refresh user data when screen comes back into focus (e.g., after modal closes)
  // Only refresh once per focus event to avoid infinite loop
  useFocusEffect(
    useCallback(() => {
      refreshUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const statusStyle = isDark ? "light" : "dark";
  const backgroundColor = colors.background;
  const textColor = colors.text;
  const secondaryTextColor = isDark ? "#c9c9ce" : "#8e8e93";
  const pillBackgroundColor = isDark ? "#1C1C1E" : "#F2F2F7";

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
      ]}
    >
      <GoBackButton />
      <ProfileMenu />
      <StatusBar style={statusStyle} animated />

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        entering={FadeInLeft}
        exiting={FadeOutRight}
      >
        {!loading && user && (
          <>
            <ProfileBanner
              bannerUrl={user.profileBanner}
              username={user.username}
              email={user.email}
              scrollY={scrollY}
              backgroundColor={backgroundColor}
              textColor={textColor}
              secondaryTextColor={secondaryTextColor}
            />
            <View style={[styles.contentContainer, { backgroundColor }]}> 
              <StatisticsPills
                movieCount={statistics.movieCount}
                tvCount={statistics.tvCount}
                movieRuntime={statistics.movieRuntime}
                tvEpisodesCount={statistics.tvEpisodesCount}
                pillBackgroundColor={pillBackgroundColor}
                textColor={textColor}
              />
            </View>
            {/* Additional profile content will be added here later */}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 300,
  },
});
