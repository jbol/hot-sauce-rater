import StarRating from './StarRating';
import HeatLevel from './HeatLevel';

export default function HotSauceCard({ sauce, userRating, isFavorite, onRate, onToggleFavorite }) {
  return (
    <div className={`sauce-card ${isFavorite ? 'favorite' : ''}`}>
      <div className="sauce-header">
        <div className="sauce-title">
          <h3>{sauce.name}</h3>
          <span className="brand">{sauce.brand}</span>
        </div>
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(sauce.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <p className="description">{sauce.description}</p>

      <div className="sauce-details">
        <HeatLevel level={sauce.heatLevel} max={sauce.maxHeat} />
        <div className="detail-row">
          <span className="detail-label">Scoville:</span>
          <span className="detail-value">{sauce.scoville}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Peppers:</span>
          <span className="detail-value">{sauce.peppers.join(', ')}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Origin:</span>
          <span className="detail-value">{sauce.origin}</span>
        </div>
      </div>

      <div className="user-rating">
        <span className="rating-label">Your Rating:</span>
        <StarRating rating={userRating || 0} onRate={(rating) => onRate(sauce.id, rating)} />
      </div>
    </div>
  );
}
