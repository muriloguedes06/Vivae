import { useCallback, useEffect, useState } from "react";
import { getTmdbMovie, getTmdbMovies } from "../api/api";
import type { TmdbMovie } from "../types";

export function useTmdbMovies() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const search = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await getTmdbMovies(query);
      setMovies(response.results);
    } catch {
      setError("Não foi possível carregar o catálogo da TMDb.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialMovies() {
      try {
        const response = await getTmdbMovies();
        setMovies(response.results);
      } catch {
        setError("Não foi possível carregar o catálogo da TMDb.");
      } finally {
        setLoading(false);
      }
    }
    void loadInitialMovies();
  }, []);
  return { movies, loading, error, search };
}

export function useTmdbMovie(id?: string) {
  const [movie, setMovie] = useState<TmdbMovie>();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getTmdbMovie(id)
      .then(setMovie)
      .catch(() => setError("Não foi possível carregar o filme."))
      .finally(() => setLoading(false));
  }, [id]);
  return { movie, loading, error };
}
