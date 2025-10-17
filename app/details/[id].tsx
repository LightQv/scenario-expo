import { View, StyleSheet, PlatformColor, Pressable } from "react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";
import { notifyError } from "@/components/toasts/Toast";
import Banner from "@/components/details/Banner";
import DetailHeader from "@/components/details/DetailHeader";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  FadeInLeft,
  FadeOutRight,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function DetailsScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const [data, setData] = useState<TmdbDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const navigation = useNavigation();

  // Shared value for scroll offset (replaces deprecated useScrollViewOffset)
  const scrollY = useSharedValue(0);

  // Fetch data based on type and id
  useEffect(() => {
    if (type && id) {
      setLoading(true);
      setData(null);
      scrollY.value = 0;

      tmdbFetch(
        `/${type}/${id}?language=${i18n.locale}&append_to_response=videos,credits`,
      )
        .then((response) => {
          setData(response);
          setLoading(false);
        })
        .catch(() => {
          notifyError(i18n.t("toast.errorTMDB"));
          setLoading(false);
        });
    }
  }, [type, id]);

  // Status bar - always light for now (over the image)
  const [statusStyle] = useState<"light" | "dark" | "auto">("light");

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Configure header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerLeft: () => (
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#fff"
            style={{ marginLeft: 2 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, router]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
    >
      <StatusBar style={statusStyle} animated />

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        entering={FadeInLeft}
        exiting={FadeOutRight}
      >
        {data && (
          <>
            <Banner
              src={data.backdrop_path}
              alt={data.title || data.name}
              score={data.vote_average}
              videos={data.videos?.results}
              scrollY={scrollY}
            />
            <DetailHeader
              title={data.title || data.name}
              originalTitle={data.original_title || data.name}
              genres={data.genres}
              overview={data.overview}
              releaseDate={data.release_date}
              runtime={data.runtime}
              status={data.status}
              firstAirDate={data.first_air_date}
              lastAirDate={data.last_air_date}
              numberOfSeasons={data.number_of_seasons}
              numberOfEpisodes={data.number_of_episodes}
            />
            {/* More content sections will be added here */}
            <View
              style={{
                height: 1000,
                backgroundColor: PlatformColor("systemBackground"),
              }}
            />
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
});
