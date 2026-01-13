import { useState } from 'react';

export default function StarRating({ rating, onRate, readonly = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
      {rating > 0 && <span className="rating-text">{rating}/5</span>}
    </div>
  );
}
