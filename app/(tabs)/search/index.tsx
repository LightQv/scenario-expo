import {
  StyleSheet,
  ScrollView,
  View,
  PlatformColor,
  ActivityIndicator,
} from "react-native";
import { useGenreContext } from "@/contexts/GenreContext";
import GenreCard from "@/components/search/GenreCard";
import HeaderTitle from "@/components/ui/HeaderTitle";
import i18n from "@/services/i18n";
import { TOKENS } from "@/constants/theme";

export default function SearchIndexScreen() {
  const { totalGenres, loading } = useGenreContext();

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: PlatformColor("systemBackground") },
        ]}
      >
        <ActivityIndicator size="large" color={PlatformColor("label")} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: PlatformColor("systemBackground") },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HeaderTitle title={i18n.t("screen.search.title")} />

      <View style={styles.grid}>
        {totalGenres?.map((genre) => (
          <GenreCard key={genre.id} id={genre.id} name={genre.name} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingTop: 16,
    paddingHorizontal: TOKENS.margin.horizontal,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
