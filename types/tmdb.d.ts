//--- Used for Search Results ---//
interface TmdbData {
  /* Overall type */
  media_type: string;

  /* Movie & TV Show type */
  first_air_date?: string;
  genre_ids: Array<number>;
  id: number;
  origin_country: Array<string>;
  overview: string;
  poster_path?: string;
  release_date?: string;
  title: string;
  vote_average: number;
  vote_count: number;

  /* Person type */
  known_for: Array<PersonKnownFor>;
  known_for_department: string;
  name: string;
  original_name: string;
  profile_path?: string;
}

type PersonKnownFor = {
  first_air_date?: string;
  id: number;
  media_type: string;
  name: string;
  poster_path: string;
  profile_path: string;
  title: string;
  release_date?: string;
};

//--- Extends Results with full data details ---//
interface TmdbDetails extends TmdbData {
  /* Overall type */
  backdrop_path: string;
  genres: Array<Genre>;
  images: Images;
  original_language: string;
  production_companies: Array<object>;
  production_countries: Array<object>;
  videos: Videos;

  /* Movie type */
  runtime: number;

  /* Tv type */
  last_air_date: string | null;
  networks: Array<object>;
  next_episode_to_air: number | null;
  number_of_episodes: number;
  number_of_seasons: number;
  original_language: string;
  original_title: string;
  seasons: Array<Season>;
  status: string;

  /* Person type */
  biography: string;
}

type Crew = {
  job: string;
  name: string;
};

type Genre = {
  id: number;
  name: string;
};

type Season = {
  air_date: string | null;
  episode_count: number | null;
  id: number;
  name: string;
  poster_path: string | null;
};

type Videos = {
  [key: string]: Array<Video>;
};

type Video = {
  key: string;
  name: string;
  official: boolean;
  site: string;
  type: string;
};

//--- Credit Type ---//
interface Credit {
  cast: Array<Cast>;
}

type Cast = {
  character?: string;
  id: number;
  known_for_department: string;
  name: string;
  profile_path: string;
};

//--- Person's Movie List ---//
interface PersonDatasList {
  [key: string]: Array<PersonDataList>;
}

type PersonDataList = {
  character: string;
  id: number;
  media_type: string;
  popularity: number;
  poster_path: string;
  vote_count: number;

  /* Movie type */
  release_date?: string;
  title?: string;

  /* Tv type */
  first_air_date?: string;
  name: string;
};

//--- Providers Type ---//
interface Providers {
  [key: string]: Provider;
}

interface Provider {
  buy?: Array<ProviderDetails>;
  flatrate?: Array<ProviderDetails>;
}

type ProviderDetails = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
};

//--- Screenshot Type ---//
interface Screenshots {
  [key: string]: Array<Screenshot>;
}

type Screenshot = {
  id: number;
  file_path: string;
  vote_count: number;
};

//--- Images Type ---//
interface Images {
  backdrops: Array<ImageDetails>;
  posters: Array<ImageDetails>;
  logos?: Array<ImageDetails>;
}

type ImageDetails = {
  aspect_ratio: number;
  file_path: string;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
  width: number;
};
