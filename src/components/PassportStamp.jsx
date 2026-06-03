// Color palette keyed to heat level (1–5)
const HEAT_COLORS = {
  1: '#16a34a',  // green  — mild
  2: '#d97706',  // amber  — medium
  3: '#ea580c',  // orange — hot
  4: '#dc2626',  // red    — very hot
  5: '#7c3aed',  // purple — inferno
};

const HEAT_LABELS = {
  1: 'MILD',
  2: 'MEDIUM',
  3: 'HOT',
  4: 'EXTRA HOT',
  5: 'INFERNO',
};

const COUNTRY_CODES = {
  USA:     'US',
  Mexico:  'MX',
  Belize:  'BZ',
  Thailand:'TH',
  Jamaica: 'JM',
  UK:      'UK',
};

function getCountryCode(origin) {
  return COUNTRY_CODES[origin] || origin.slice(0, 2).toUpperCase();
}

// Deterministic pseudo-random rotation — keeps stamps consistently skewed
function getRotation(id) {
  return ((id * 7 + 3) % 21) - 10;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function PassportStamp({ sauce, rating, ratedAt, isFavorite, unrated }) {
  const color  = unrated ? '#b0a090' : HEAT_COLORS[sauce.heatLevel];
  const rotation = getRotation(sauce.id);

  const heatDots = unrated
    ? '○○○○○'
    : '●'.repeat(sauce.heatLevel) + '○'.repeat(5 - sauce.heatLevel);

  const stars = !unrated && rating
    ? '★'.repeat(rating) + '☆'.repeat(5 - rating)
    : null;

  return (
    <div
      className={`stamp ${unrated ? 'stamp-unrated' : 'stamp-rated'}`}
      style={{ '--stamp-color': color, '--stamp-rot': `${rotation}deg` }}
      title={
        unrated
          ? `${sauce.name} — not yet tasted`
          : `${sauce.name} · ${sauce.origin} · ${rating ?? 0}/5 stars`
      }
    >
      {/* Ink bleed layer — gives a worn, slightly-bleeding ink look */}
      {!unrated && <div className="stamp-ink-bleed" />}

      {/* Outer ring */}
      <div className="stamp-outer">
        {/* Inner ring */}
        <div className="stamp-inner">
          <div className="stamp-body">
            <div className="stamp-top-arc">{getCountryCode(sauce.origin)}</div>
            {!unrated && (
              <div className="stamp-sub">{HEAT_LABELS[sauce.heatLevel]}</div>
            )}
            <div className="stamp-name">{sauce.name}</div>
            <div className="stamp-dots">{heatDots}</div>
            {stars && <div className="stamp-stars">{stars}</div>}
            {!unrated && ratedAt && (
              <div className="stamp-date">{formatDate(ratedAt)}</div>
            )}
            {unrated && <div className="stamp-pending">NOT YET TASTED</div>}
          </div>
        </div>
      </div>

      {/* Favourite gold badge */}
      {isFavorite && !unrated && (
        <div className="stamp-fav-badge" title="Favourite">★</div>
      )}
    </div>
  );
}
