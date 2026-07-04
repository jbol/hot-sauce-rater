import { useState } from 'react';

const STAR = 'M12 2.6l2.85 5.85 6.4.9-4.65 4.5 1.1 6.4L12 17.2l-5.7 3.05 1.1-6.4-4.65-4.5 6.4-.9z';

function Star({ filled, size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d={STAR}
        fill={filled ? '#c9962b' : 'none'}
        stroke={filled ? '#8a6420' : '#b39a6b'}
        strokeWidth="1.4"
      />
    </svg>
  );
}

// Gold stars, 1–5. Read-only without onChange; with onChange it's a picker
// (clicking the current value clears it back to "no rating").
export default function StarRating({ value = 0, onChange, size = 20, className = '' }) {
  const [hover, setHover] = useState(null);
  const interactive = typeof onChange === 'function';
  const shown = (interactive && hover) || value || 0;

  if (!interactive) {
    return (
      <span className={`stars ${className}`} aria-label={value ? `${value} de 5 estrellas` : 'Sin puntuación'}>
        {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= shown} size={size} />)}
      </span>
    );
  }

  return (
    <span className={`stars stars-interactive ${className}`} onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="star-btn"
          title={n === value ? 'Quitar puntuación' : `${n} de 5`}
          aria-label={`${n} de 5 estrellas`}
          aria-pressed={n <= (value || 0)}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n === value ? null : n)}
        >
          <Star filled={n <= shown} size={size} />
        </button>
      ))}
    </span>
  );
}
