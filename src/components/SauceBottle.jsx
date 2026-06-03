import { useId } from 'react';

/*
 * SauceBottle — a flamenco hot-sauce bottle icon (after "Caliente Bailaora"):
 * gold cap, black lace mantilla, rose cluster, embroidered shawl, a cream
 * label with a tiny dancer, and a ruffled polka-dot skirt at the base.
 * The sauce, roses, shawl and skirt are tinted by heat level so each
 * spiciness tier reads as a distinct colour (mild → inferno).
 */
const HEAT_PALETTE = {
  1: { base: '#1aa64a', dark: '#0e7a35', light: '#5fe089' }, // MILD      · green
  2: { base: '#e08a12', dark: '#a85f05', light: '#ffc24d' }, // MEDIUM    · amber
  3: { base: '#ec5c12', dark: '#b8430a', light: '#ff8c4a' }, // HOT       · orange
  4: { base: '#e02828', dark: '#a01b1b', light: '#ff5e5e' }, // EXTRA HOT · red
  5: { base: '#7c3aed', dark: '#5b21b6', light: '#a98bff' }, // INFERNO   · purple
};

const GOLD = { light: '#f4d77a', mid: '#d9b441', dark: '#a8801f' };
const CREAM = '#f6ecd6';
const VEIL = '#1c1418';

export default function SauceBottle({ heatLevel = 1, muted = false, title, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const p = HEAT_PALETTE[heatLevel] || HEAT_PALETTE[1];
  const bodyGrad = `body-${uid}`;
  const capGrad = `cap-${uid}`;

  return (
    <svg
      viewBox="0 0 80 124"
      className={`sauce-bottle ${muted ? 'sauce-bottle--muted' : ''} ${className}`.trim()}
      role="img"
      aria-label={title || `Heat level ${heatLevel} hot sauce bottle`}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.35" stopColor={p.base} />
          <stop offset="1" stopColor={p.dark} />
        </linearGradient>
        <linearGradient id={capGrad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD.dark} />
          <stop offset="0.5" stopColor={GOLD.light} />
          <stop offset="1" stopColor={GOLD.mid} />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="40" cy="120" rx="22" ry="3.2" fill="#000" opacity="0.16" />

      {/* ── Mantilla veil (black lace cape behind the neck) ── */}
      <path
        d="M40 15 C22 17 13 30 17 43 C27 45 32 41 40 41 C48 41 53 45 63 43 C67 30 58 17 40 15 Z"
        fill={VEIL}
        opacity="0.9"
      />
      {[20, 26, 32, 38, 44, 50, 56].map((x) => (
        <circle key={`lace-${x}`} cx={x} cy="42" r="1.5" fill="#fff" opacity="0.1" />
      ))}

      {/* ── Bottle silhouette (neck + shoulders + body), sauce-filled ── */}
      <path
        d="M34 18 L34 30 C30 34 24 39 23 50 L22 92 C22 100 26 105 33 106 L47 106 C54 105 58 100 58 92 L57 50 C56 39 50 34 46 30 L46 18 Z"
        fill={`url(#${bodyGrad})`}
        stroke={p.dark}
        strokeWidth="0.8"
      />
      {/* glass highlight + sauce bubbles */}
      <path d="M28 50 Q25 72 30 95 Q33 72 32 50 Z" fill={p.light} opacity="0.35" />
      <circle cx="46" cy="60" r="1.6" fill={p.light} opacity="0.5" />
      <circle cx="50" cy="70" r="1.1" fill={p.light} opacity="0.45" />
      <circle cx="44" cy="80" r="1.3" fill={p.light} opacity="0.4" />

      {/* ── Label (cream) with tiny flamenco dancer ── */}
      <rect x="28" y="58" width="24" height="23" rx="3" fill={CREAM} stroke={p.dark} strokeWidth="0.6" />
      <rect x="30" y="60" width="20" height="19" rx="2" fill="none" stroke={p.base} strokeWidth="0.4" opacity="0.5" />
      <circle cx="40" cy="63" r="1.5" fill={p.dark} />
      <path d="M40 65 L41.4 70 L44 77 L36 77 L38.6 70 Z" fill={p.dark} />
      <path d="M40 66 L44.5 63.6" fill="none" stroke={p.dark} strokeWidth="0.9" strokeLinecap="round" />
      <rect x="32" y="78" width="16" height="1.2" rx="0.6" fill={p.base} opacity="0.45" />

      {/* ── Shawl over the shoulders (tinted, embroidered) ── */}
      <path d="M31 32 Q40 30 49 32 L46 41 Q40 44 34 41 Z" fill={p.base} stroke={p.dark} strokeWidth="0.4" />
      <circle cx="40" cy="36" r="1.6" fill={p.light} />
      <circle cx="40" cy="36" r="0.7" fill={GOLD.mid} />
      {[34, 37, 40, 43, 46].map((x) => (
        <line key={`fr-${x}`} x1={x} y1="41.5" x2={x} y2="44" stroke={p.dark} strokeWidth="0.6" />
      ))}

      {/* ── Rose cluster at the neck (tinted) ── */}
      {[[34, 29], [40, 27], [46, 29]].map(([cx, cy]) => (
        <g key={`rose-${cx}`}>
          <circle cx={cx} cy={cy} r="3" fill={p.base} stroke={p.dark} strokeWidth="0.4" />
          <circle cx={cx} cy={cy} r="1.5" fill={p.light} />
          <circle cx={cx} cy={cy} r="0.6" fill={p.dark} />
        </g>
      ))}

      {/* ── Cap (gold screw top) ── */}
      <rect x="33" y="6" width="14" height="13" rx="2" fill={`url(#${capGrad})`} stroke={GOLD.dark} strokeWidth="0.5" />
      <line x1="33" y1="10" x2="47" y2="10" stroke={GOLD.dark} strokeWidth="0.5" opacity="0.6" />
      <line x1="33" y1="13.5" x2="47" y2="13.5" stroke={GOLD.dark} strokeWidth="0.5" opacity="0.6" />
      <rect x="36" y="4" width="8" height="3" rx="1" fill={GOLD.mid} />

      {/* ── Flamenco ruffle skirt at the base (tinted) ── */}
      <path
        d="M23 92 C17 96 14 101 15 107 Q21 111 27 108 Q33 112 40 108 Q47 112 53 108 Q59 111 65 107 C66 101 63 96 57 92 Z"
        fill={p.base}
        stroke={p.dark}
        strokeWidth="0.5"
      />
      {[[24, 101], [32, 105], [40, 101], [48, 105], [56, 101]].map(([cx, cy]) => (
        <circle key={`pu-${cx}`} cx={cx} cy={cy} r="1.3" fill="#fff" opacity="0.8" />
      ))}
      <path
        d="M16 104 C13 109 13 114 17 118 Q25 122 32 118 Q40 122 48 118 Q55 122 63 118 C67 114 67 109 64 104 Q56 108 48 105 Q40 109 32 105 Q24 108 16 104 Z"
        fill={p.dark}
      />
      {[[22, 112], [30, 114], [40, 112], [50, 114], [58, 112]].map(([cx, cy]) => (
        <circle key={`pl-${cx}`} cx={cx} cy={cy} r="1.2" fill="#fff" opacity="0.7" />
      ))}
      {[18, 24, 30, 36, 42, 48, 54, 60].map((x) => (
        <circle key={`trim-${x}`} cx={x} cy="119" r="2" fill={VEIL} opacity="0.85" />
      ))}
    </svg>
  );
}
