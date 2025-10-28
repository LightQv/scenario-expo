interface APIMedia {
  id: string;
  tmdb_id: number;
  genre_ids: number[];
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  release_year: string;
  runtime: number;
  title: string;
  media_type: string;
  viewer_id?: string;
  watchlistId?: string;
}

interface ViewCreate {
  tmdb_id: number;
  genre_ids: number[];
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  release_year: string;
  runtime: number;
  title: string;
  media_type: string;
  viewer_id: string;
}

interface Media {
  _count: { medias: number };
  medias: APIMedia[];
  title: string;
}

interface MediaRelease {
  _count: number;
  release_year: number;
}

interface Watchlist {
  id: string;
  title: string;
  authorId: string;
  medias_count: number;
  medias: [{ id: string; tmdb_id: number }];
}

interface User {
  id: string;
  username: string;
  email: string;
  profileBanner?: string;
}

interface SearchHistory {
  query: string;
  total_results: number;
}
