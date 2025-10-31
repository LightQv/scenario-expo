import { useEffect, useState } from "react";
import { useGenreContext } from "@/contexts/GenreContext";

/**
 * Hook pour obtenir les noms des genres d'un média à partir de ses IDs
 * @param data - Les données du média TMDB
 * @param mediaType - Le type de média ('movie' ou 'tv'), optionnel si data.media_type existe
 * @returns Un tableau de noms de genres ou null
 */
export default function useGenre(
  data: TmdbData,
  mediaType?: string,
): string[] | null {
  const { movieGenres, tvGenres, loading } = useGenreContext();
  const [genreNames, setGenreNames] = useState<string[] | null>(null);

  useEffect(() => {
    // Ne rien faire si les genres ne sont pas encore chargés
    if (loading || !data.genre_ids || data.genre_ids.length === 0) {
      setGenreNames(null);
      return;
    }

    // Déterminer le type de média
    const type = data.media_type || mediaType;

    // Sélectionner la liste de genres appropriée
    let genreList = null;
    if (type === "movie" && movieGenres) {
      genreList = movieGenres;
    } else if (type === "tv" && tvGenres) {
      genreList = tvGenres;
    }

    // Si aucune liste de genres n'est disponible, on ne peut rien faire
    if (!genreList) {
      setGenreNames(null);
      return;
    }

    // Mapper les IDs de genres aux noms
    const names = data.genre_ids
      .map((genreId) => {
        const genre = genreList.find((g) => g.id === genreId);
        return genre?.name;
      })
      .filter((name): name is string => name !== undefined); // Filtrer les undefined

    setGenreNames(names.length > 0 ? names : null);
  }, [
    data.genre_ids,
    data.media_type,
    mediaType,
    movieGenres,
    tvGenres,
    loading,
  ]);

  return genreNames;
}
