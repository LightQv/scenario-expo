import {
  ColorValue,
  FlatList,
  ListRenderItem,
  PlatformColor,
  View,
  StyleSheet,
} from "react-native";
import { memo, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { useOwnedMediaContext, useThemeContext, useUserContext } from "@/contexts";
import { apiFetch } from "@/services/instances";
import {
  getDownloadSettingsOverview,
  isRadarrReady,
  isSonarrReady,
  type DownloadSettingsOverview,
} from "@/services/downloadSettings";
import { notifyError } from "@/components/toasts/Toast";
import i18n from "@/services/i18n";
import ProfileBanner from "@/components/profile/ProfileBanner";
import StatisticsPills from "@/components/profile/StatisticsPills";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileBadgeRow from "@/components/profile/ProfileBadgeRow";
import GoBackButton from "@/components/ui/GoBackButton";
import { useTransparentNavigationBarAppearance } from "@/hooks/useTransparentNavigationBarAppearance";
import {
  createCurrentBadgeDisplay,
  createProfileBadges,
  fetchProfileBadges,
  type ProfileBadge,
} from "@/services/badges";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ProfileBadge>);

type Statistics = {
  movieCount: number;
  tvCount: number;
  movieRuntime: number;
};

const ListHeader = memo(
  ({
    user,
    statistics,
    ownedMovieCount,
    ownedTvCount,
    showAvailableMovieCount,
    showAvailableTvCount,
    scrollY,
    backgroundColor,
    fadeBackgroundColor,
    textColor,
    secondaryTextColor,
    pillBackgroundColor,
  }: {
    user: User;
    statistics: Statistics;
    ownedMovieCount: number;
    ownedTvCount: number;
    showAvailableMovieCount: boolean;
    showAvailableTvCount: boolean;
    scrollY: SharedValue<number>;
    backgroundColor: ColorValue;
    fadeBackgroundColor: string;
    textColor: string;
    secondaryTextColor: string;
    pillBackgroundColor: ColorValue;
  }) => (
    <>
      <ProfileBanner
        bannerUrl={user.profileBanner}
        username={user.username}
        email={user.email}
        scrollY={scrollY}
        backgroundColor={backgroundColor}
        fadeBackgroundColor={fadeBackgroundColor}
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
      />
      <View style={[styles.contentContainer, { backgroundColor }]}> 
        <StatisticsPills
          movieCount={statistics.movieCount}
          tvCount={statistics.tvCount}
          movieRuntime={statistics.movieRuntime}
          availableMovieCount={ownedMovieCount}
          availableTvCount={ownedTvCount}
          showAvailableMovieCount={showAvailableMovieCount}
          showAvailableTvCount={showAvailableTvCount}
          pillBackgroundColor={pillBackgroundColor}
          textColor={textColor}
        />
      </View>
    </>
  ),
);

ListHeader.displayName = "ProfileListHeader";

export default function ProfileScreen() {
  const { colors, isDark } = useThemeContext();
  const { user, refreshUser } = useUserContext();
  const { ownedMedia, ownedTvShows } = useOwnedMediaContext();
  const [statistics, setStatistics] = useState<Statistics>({
    movieCount: 0,
    tvCount: 0,
    movieRuntime: 0,
  });
  const [downloadOverview, setDownloadOverview] =
    useState<DownloadSettingsOverview | null>(null);
  const [backendBadges, setBackendBadges] = useState<ProfileBadge[] | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollY = useSharedValue(0);
  const scrollRef = useRef(null);
  useTransparentNavigationBarAppearance(scrollRef);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const [movieCountData, tvCountData, movieRuntimeData] =
        await Promise.all([
          apiFetch(`/api/v1/statistics/count/movie/${user.id}`),
          apiFetch(`/api/v1/statistics/count/tv/${user.id}`),
          apiFetch(`/api/v1/statistics/runtime/movie/${user.id}`),
        ]);

      const movieCount =
        movieCountData.length > 0 ? movieCountData[0].count : 0;

      const tvCount = tvCountData.length > 0 ? tvCountData[0].count : 0;

      const movieRuntime = movieRuntimeData.reduce(
        (total: number, item: { runtime: number }) => total + item.runtime,
        0,
      );

      setStatistics({
        movieCount,
        tvCount,
        movieRuntime,
      });
    } catch (error) {
      notifyError(i18n.t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      const badges = await fetchProfileBadges();
      setBackendBadges(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      setBackendBadges(null);
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
      getDownloadSettingsOverview()
        .then(setDownloadOverview)
        .catch(() => setDownloadOverview(null));
      fetchBadges();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchBadges]),
  );

  const statusStyle = isDark ? "light" : "dark";
  const backgroundColor = PlatformColor("systemBackground");
  const fadeBackgroundColor = isDark ? "#000" : "#fff";
  const textColor = colors.text;
  const secondaryTextColor = isDark ? "#c9c9ce" : "#8e8e93";
  const pillBackgroundColor = isDark ? "#1C1C1E" : "#F2F2F7";
  const ownedMovieCount = ownedMedia.filter(
    (item) => item.media_type === "movie",
  ).length;
  const ownedTvCount = ownedTvShows.length;
  const showAvailableMovieCount = isRadarrReady(downloadOverview);
  const showAvailableTvCount = isSonarrReady(downloadOverview);
  const localBadges = useMemo(
    () =>
      createProfileBadges({
        movieCount: statistics.movieCount,
        tvShowCount: statistics.tvCount,
        availableMovieCount: ownedMovieCount,
      }),
    [statistics.movieCount, statistics.tvCount, ownedMovieCount],
  );
  const badges = backendBadges || localBadges;
  const displayedBadges = showAllBadges
    ? badges.map((badge) => ({ ...badge, displayTier: badge.tier }))
    : createCurrentBadgeDisplay(badges);

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const renderBadge: ListRenderItem<ProfileBadge> = useCallback(
    ({ item }) => (
      <ProfileBadgeRow
        badge={item}
        backgroundColor={backgroundColor}
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
        progressTrackColor={pillBackgroundColor}
      />
    ),
    [backgroundColor, pillBackgroundColor, secondaryTextColor, textColor],
  );

  const renderItemSeparator = useCallback(
    () => (
      <View
        style={{
          height: 2,
          backgroundColor,
        }}
      />
    ),
    [backgroundColor],
  );

  const renderListHeader = useCallback(() => {
    if (loading || !user) return null;
    return (
      <ListHeader
        user={user}
        statistics={statistics}
        ownedMovieCount={ownedMovieCount}
        ownedTvCount={ownedTvCount}
        showAvailableMovieCount={showAvailableMovieCount}
        showAvailableTvCount={showAvailableTvCount}
        scrollY={scrollY}
        backgroundColor={backgroundColor}
        fadeBackgroundColor={fadeBackgroundColor}
        textColor={textColor}
        secondaryTextColor={secondaryTextColor}
        pillBackgroundColor={pillBackgroundColor}
      />
    );
  }, [
    backgroundColor,
    fadeBackgroundColor,
    loading,
    ownedMovieCount,
    ownedTvCount,
    pillBackgroundColor,
    scrollY,
    secondaryTextColor,
    showAvailableMovieCount,
    showAvailableTvCount,
    statistics,
    textColor,
    user,
  ]);

  const keyExtractor = useCallback((item: ProfileBadge) => item.id, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
      ]}
    >
      <GoBackButton />
      <ProfileMenu
        showAllBadges={showAllBadges}
        onToggleAllBadges={() => setShowAllBadges((value) => !value)}
      />
      <StatusBar style={statusStyle} animated />

      <AnimatedFlatList
        ref={scrollRef}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        entering={FadeInLeft}
        exiting={FadeOutRight}
        data={!loading && user ? displayedBadges : []}
        renderItem={renderBadge}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader()}
        ItemSeparatorComponent={renderItemSeparator}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 28,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 34,
  },
});
