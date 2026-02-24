import { useState, useMemo } from 'react';
import { hotSauces } from '../data/hotSauces';
import { useSauces } from '../contexts/SaucesContext';
import HotSauceCard from './HotSauceCard';

export default function ExploreView() {
  const { ratings, favorites, loading, handleRate, handleToggleFavorite } = useSauces();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let result = [...hotSauces];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.brand.toLowerCase().includes(q) ||
          s.peppers.some((p) => p.toLowerCase().includes(q))
      );
    }

    if (filter === 'favorites') result = result.filter((s) => favorites.includes(s.id));
    else if (filter === 'rated') result = result.filter((s) => ratings[s.id]);
    else if (filter === 'unrated') result = result.filter((s) => !ratings[s.id]);

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':       return a.name.localeCompare(b.name);
        case 'heat-asc':   return a.heatLevel - b.heatLevel;
        case 'heat-desc':  return b.heatLevel - a.heatLevel;
        case 'rating':     return (ratings[b.id]?.rating || 0) - (ratings[a.id]?.rating || 0);
        default:           return 0;
      }
    });

    return result;
  }, [filter, sortBy, searchQuery, favorites, ratings]);

  if (loading) {
    return (
      <div className="explore-loading">
        <span>🌶️</span> Loading sauces…
      </div>
    );
  }

  return (
    <div className="explore-view">
      <div className="explore-header">
        <h2 className="explore-title">Explore Sauces</h2>
        <p className="explore-sub">Rate a sauce to stamp your passport</p>
      </div>

      <div className="controls">
        <input
          type="search"
          placeholder="Search sauces, brands, or peppers…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="filter-sort">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="select">
            <option value="all">All Sauces</option>
            <option value="favorites">Favourites</option>
            <option value="rated">Rated</option>
            <option value="unrated">Unrated</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select">
            <option value="name">Sort by Name</option>
            <option value="heat-asc">Heat: Low → High</option>
            <option value="heat-desc">Heat: High → Low</option>
            <option value="rating">Your Rating</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No sauces match your criteria.</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="btn">
              Show All Sauces
            </button>
          )}
        </div>
      ) : (
        <div className="sauce-grid">
          {filtered.map((sauce) => (
            <HotSauceCard
              key={sauce.id}
              sauce={sauce}
              userRating={ratings[sauce.id]?.rating}
              isFavorite={favorites.includes(sauce.id)}
              onRate={handleRate}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
