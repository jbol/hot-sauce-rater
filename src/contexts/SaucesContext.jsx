import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const SaucesContext = createContext(null);

export function SaucesProvider({ children }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.sauces
      .getUserData()
      .then((data) => {
        setRatings(data.ratings || {});
        setFavorites(data.favorites || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleRate = useCallback(async (sauceId, rating) => {
    await api.sauces.rate(sauceId, rating);
    setRatings((prev) => ({
      ...prev,
      [sauceId]: { rating, ratedAt: new Date().toISOString() },
    }));
  }, []);

  const handleToggleFavorite = useCallback(async (sauceId) => {
    const result = await api.sauces.toggleFavorite(sauceId);
    setFavorites((prev) =>
      result.favorited ? [...prev, sauceId] : prev.filter((id) => id !== sauceId)
    );
    return result.favorited;
  }, []);

  return (
    <SaucesContext.Provider
      value={{ ratings, favorites, loading, handleRate, handleToggleFavorite }}
    >
      {children}
    </SaucesContext.Provider>
  );
}

export function useSauces() {
  const ctx = useContext(SaucesContext);
  if (!ctx) throw new Error('useSauces must be used inside <SaucesProvider>');
  return ctx;
}
