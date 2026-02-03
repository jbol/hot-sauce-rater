import { useState, useMemo } from 'react';
import { hotSauces } from './data/hotSauces';
import { useLocalStorage } from './hooks/useLocalStorage';
import HotSauceCard from './components/HotSauceCard';

export default function App() {
  const [ratings, setRatings] = useLocalStorage('hotSauceRatings', {});
  const [favorites, setFavorites] = useLocalStorage('hotSauceFavorites', []);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRate = (sauceId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [sauceId]: rating,
    }));
  };

  const handleToggleFavorite = (sauceId) => {
    setFavorites((prev) =>
      prev.includes(sauceId)
        ? prev.filter((id) => id !== sauceId)
        : [...prev, sauceId]
    );
  };

  const filteredAndSortedSauces = useMemo(() => {
    let result = [...hotSauces];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (sauce) =>
          sauce.name.toLowerCase().includes(query) ||
          sauce.brand.toLowerCase().includes(query) ||
          sauce.peppers.some((p) => p.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filter === 'favorites') {
      result = result.filter((sauce) => favorites.includes(sauce.id));
    } else if (filter === 'rated') {
      result = result.filter((sauce) => ratings[sauce.id]);
    } else if (filter === 'unrated') {
      result = result.filter((sauce) => !ratings[sauce.id]);
    }

    // Apply sorting
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'heat-asc':
          return a.heatLevel - b.heatLevel;
        case 'heat-desc':
          return b.heatLevel - a.heatLevel;
        case 'rating':
          return (ratings[b.id] || 0) - (ratings[a.id] || 0);
        default:
          return 0;
      }
    });
  }, [filter, sortBy, searchQuery, favorites, ratings]);

  const stats = useMemo(() => {
    const ratingValues = Object.values(ratings);
    const avgRating = ratingValues.length
      ? (ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1)
      : 0;

    return {
      total: hotSauces.length,
      rated: ratingValues.length,
      favorites: favorites.length,
      avgRating,
    };
  }, [ratings, favorites]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🌶️ Hot Sauce Rater</h1>
          <p className="tagline">Rate, review, and track your favorite hot sauces</p>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Sauces</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.rated}</span>
          <span className="stat-label">Rated</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.favorites}</span>
          <span className="stat-label">Favorites</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.avgRating}</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </div>

      <main className="main">
        <div className="controls">
          <input
            type="search"
            placeholder="Search sauces, brands, peppers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <div className="filter-sort">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="all">All Sauces</option>
              <option value="favorites">Favorites</option>
              <option value="rated">Rated</option>
              <option value="unrated">Unrated</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select"
            >
              <option value="name">Sort by Name</option>
              <option value="heat-asc">Heat: Low to High</option>
              <option value="heat-desc">Heat: High to Low</option>
              <option value="rating">Your Rating</option>
            </select>
          </div>
        </div>

        {filteredAndSortedSauces.length === 0 ? (
          <div className="empty-state">
            <p>No sauces found matching your criteria.</p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn">
                Show All Sauces
              </button>
            )}
          </div>
        ) : (
          <div className="sauce-grid">
            {filteredAndSortedSauces.map((sauce) => (
              <HotSauceCard
                key={sauce.id}
                sauce={sauce}
                userRating={ratings[sauce.id]}
                isFavorite={favorites.includes(sauce.id)}
                onRate={handleRate}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with 🔥 for hot sauce enthusiasts</p>
      </footer>
    </div>
  );
}
