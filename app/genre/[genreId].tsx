import { useLocalSearchParams } from "expo-router";
import GenreResultsScreen from "@/components/search/GenreResultsScreen";

export default function RootGenreResultsRoute() {
  const { genreId, genreName } = useLocalSearchParams<{
    genreId: string;
    genreName?: string;
  }>();

  return <GenreResultsScreen genreId={genreId} genreName={genreName} />;
}
