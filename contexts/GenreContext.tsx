import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tmdbFetch } from "@/services/instances";
import i18n from "@/services/i18n";

interface Genre {
  id: number;
  name: string;
}

interface GenreContextProps {
  movieGenres: Genre[] | null;
  tvGenres: Genre[] | null;
  totalGenres: Genre[] | null;
  loading: boolean;
}

const GenreContext = createContext<GenreContextProps>({
  movieGenres: null,
  tvGenres: null,
  totalGenres: null,
  loading: true,
});

export const useGenreContext = () => {
  return useContext(GenreContext);
};

export function GenreProvider({ children }: { children: React.ReactNode }) {
  const [movieGenres, setMovieGenres] = useState<Genre[] | null>(null);
  const [tvGenres, setTvGenres] = useState<Genre[] | null>(null);
  const [totalGenres, setTotalGenres] = useState<Genre[] | null>(null);
  const [loading, setLoading] = useState(true);

  const genreContextValue = useMemo(
    () => ({
      movieGenres,
      tvGenres,
      totalGenres,
      loading,
    }),
    [movieGenres, tvGenres, totalGenres, loading],
  );

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);

        // Fetch movie and TV genres in parallel
        const [movieResponse, tvResponse] = await Promise.all([
          tmdbFetch(`/genre/movie/list?language=${i18n.locale}`),
          tmdbFetch(`/genre/tv/list?language=${i18n.locale}`),
        ]);

        setMovieGenres(movieResponse.genres);
        setTvGenres(tvResponse.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
        // Keep null values in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [i18n.locale]);

  // Combine and deduplicate genres when both lists are loaded
  useEffect(() => {
    if (movieGenres && tvGenres) {
      // Concatenate both arrays
      const combinedGenres = [...movieGenres, ...tvGenres];

      // Remove duplicates using a Map
      const uniqueGenresMap = new Map<number, Genre>();
      combinedGenres.forEach((genre) => {
        if (!uniqueGenresMap.has(genre.id)) {
          uniqueGenresMap.set(genre.id, genre);
        }
      });

      // Convert to array and sort by name
      const uniqueGenres = Array.from(uniqueGenresMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      setTotalGenres(uniqueGenres);
    }
  }, [movieGenres, tvGenres]);

  return (
    <GenreContext.Provider value={genreContextValue}>
      {children}
    </GenreContext.Provider>
  );
}
