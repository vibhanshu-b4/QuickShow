import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

const requireTmdbCredentials = () => {
  if (!process.env.TMDB_API_KEY && !process.env.TMDB_BEARER_TOKEN) {
    const error = new Error("TMDB_API_KEY or TMDB_BEARER_TOKEN is required");
    error.statusCode = 500;
    throw error;
  }
};

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    accept: "application/json",
    ...(process.env.TMDB_BEARER_TOKEN
      ? { Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}` }
      : {}),
  },
});

tmdb.interceptors.request.use((config) => {
  requireTmdbCredentials();

  if (!process.env.TMDB_BEARER_TOKEN && process.env.TMDB_API_KEY) {
    config.params = {
      ...config.params,
      api_key: process.env.TMDB_API_KEY,
    };
  }

  return config;
});

const tmdbRequest = async (path, params = {}) => {
  try {
    const { data } = await tmdb.get(path, { params });
    return data;
  } catch (error) {
    const message =
      error.response?.data?.status_message ||
      error.response?.data?.message ||
      error.message;

    const requestError = new Error(`TMDB request failed: ${message}`);
    requestError.statusCode = error.response?.status || 500;
    throw requestError;
  }
};

const imageUrl = (path) => (path ? `${IMAGE_BASE_URL}${path}` : "");

const youtubeTrailerUrl = (videos = []) => {
  const trailer =
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official
    ) ||
    videos.find((video) => video.site === "YouTube" && video.type === "Trailer") ||
    videos.find((video) => video.site === "YouTube");

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "";
};

export const normalizeMovie = (movie) => ({
  _id: String(movie.id),
  id: movie.id,
  title: movie.title,
  overview: movie.overview,
  poster_path: imageUrl(movie.poster_path),
  backdrop_path: imageUrl(movie.backdrop_path),
  genres: movie.genres || [],
  casts:
    movie.credits?.cast?.slice(0, 16).map((cast) => ({
      name: cast.name,
      profile_path: imageUrl(cast.profile_path),
    })) || [],
  trailerUrl: youtubeTrailerUrl(movie.videos?.results),
  trailerImage: movie.backdrop_path
    ? imageUrl(movie.backdrop_path)
    : imageUrl(movie.poster_path),
  release_date: movie.release_date,
  original_language: movie.original_language,
  tagline: movie.tagline || "",
  vote_average: movie.vote_average || 0,
  vote_count: movie.vote_count || 0,
  runtime: movie.runtime || 0,
});

export const getMovieDetails = async (movieId) => {
  const data = await tmdbRequest(`/movie/${movieId}`, {
    append_to_response: "credits,videos",
  });
  return normalizeMovie(data);
};

export const getNowPlayingMovies = async () => {
  const data = await tmdbRequest("/movie/now_playing", {
    language: "en-US",
    page: 1,
    region: process.env.TMDB_REGION || "US",
  });

  const movies = await Promise.all(
    data.results.slice(0, 12).map((movie) => getMovieDetails(movie.id))
  );

  return movies;
};
