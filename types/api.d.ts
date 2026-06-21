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
  type?: string;
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

interface BookmarkCreate {
  tmdb_id: number;
  genre_ids: number[];
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  title: string;
  media_type: string;
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
  type?: string;
  authorId: string;
  medias_count: number;
  medias: APIMedia[];
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

interface OwnedMedia {
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
  source: string;
  last_synced_at: string;
  metadata_synced_at?: string | null;
}

interface OwnedMediaSyncStatus {
  source: string;
  media_type: string;
  status: "idle" | "running" | "success" | "failed";
  trigger?: "manual" | "scheduled" | null;
  started_at?: string | null;
  finished_at?: string | null;
  owned_count?: number | null;
  error_message?: string | null;
}

type DownloadRequestStatus =
  | "requested"
  | "sent_to_radarr"
  | "searching"
  | "downloading"
  | "not_found"
  | "failed"
  | "available"
  | "cancelled";

interface DownloadRequest {
  id: string;
  user_id?: string | null;
  tmdb_id: number;
  media_type: string;
  source: string;
  status: DownloadRequestStatus;
  radarr_movie_id?: number | null;
  radarr_search_command_id?: number | null;
  genre_ids: number[];
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  release_year: string;
  runtime: number;
  title: string;
  error_message?: string | null;
  download_title?: string | null;
  download_client?: string | null;
  quality?: string | null;
  size?: number | null;
  size_left?: number | null;
  time_left?: string | null;
  tracked_download_status?: string | null;
  tracked_download_state?: string | null;
  requested_at: string;
  created_at: string;
  updated_at: string;
}
