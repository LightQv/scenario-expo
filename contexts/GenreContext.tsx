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

        // Fetch des genres de films et séries en parallèle
        const [movieResponse, tvResponse] = await Promise.all([
          tmdbFetch(`/genre/movie/list?language=${i18n.locale}`),
          tmdbFetch(`/genre/tv/list?language=${i18n.locale}`),
        ]);

        setMovieGenres(movieResponse.genres);
        setTvGenres(tvResponse.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
        // On garde les valeurs null en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [i18n.locale]);

  // Combiner et dédupliquer les genres quand les deux listes sont chargées
  useEffect(() => {
    if (movieGenres && tvGenres) {
      // Concaténer les deux tableaux
      const combinedGenres = [...movieGenres, ...tvGenres];

      // Supprimer les doublons en utilisant un Map
      const uniqueGenresMap = new Map<number, Genre>();
      combinedGenres.forEach((genre) => {
        if (!uniqueGenresMap.has(genre.id)) {
          uniqueGenresMap.set(genre.id, genre);
        }
      });

      // Convertir en tableau et trier par nom
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
