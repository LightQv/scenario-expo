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
  credits: Credit;

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
  birthday: string | null;
  deathday: string | null;
  gender: number;
  place_of_birth: string | null;
  combined_credits: PersonDatasList;
  movie_credits: PersonMovieCredits;
  tv_credits: PersonTvCredits;
}

type Crew = {
  id: number;
  job: string;
  name: string;
  department: string;
  profile_path?: string;
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
  season_number: number;
};

//--- Season Detail Type ---//
interface SeasonDetail {
  _id: string;
  air_date: string | null;
  episodes: Array<Episode>;
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

type Episode = {
  air_date: string | null;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  runtime: number | null;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew: Array<Crew>;
  guest_stars: Array<Cast>;
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
  crew: Array<Crew>;
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

//--- Person's Movie Credits ---//
interface PersonMovieCredits {
  cast: Array<PersonMovieCredit>;
  crew: Array<PersonMovieCrew>;
}

type PersonMovieCredit = {
  adult: boolean;
  backdrop_path?: string;
  character?: string;
  credit_id: string;
  genre_ids: Array<number>;
  id: number;
  order?: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  release_date?: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type PersonMovieCrew = {
  adult: boolean;
  backdrop_path?: string;
  credit_id: string;
  department: string;
  genre_ids: Array<number>;
  id: number;
  job: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  release_date?: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

//--- Person's TV Credits ---//
interface PersonTvCredits {
  cast: Array<PersonTvCredit>;
  crew: Array<PersonTvCrew>;
}

type PersonTvCredit = {
  adult: boolean;
  backdrop_path?: string;
  character?: string;
  credit_id: string;
  episode_count: number;
  first_air_date?: string;
  genre_ids: Array<number>;
  id: number;
  name: string;
  origin_country: Array<string>;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  vote_average: number;
  vote_count: number;
};

type PersonTvCrew = {
  adult: boolean;
  backdrop_path?: string;
  credit_id: string;
  department: string;
  episode_count: number;
  first_air_date?: string;
  genre_ids: Array<number>;
  id: number;
  job: string;
  name: string;
  origin_country: Array<string>;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  vote_average: number;
  vote_count: number;
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
