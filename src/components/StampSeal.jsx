import { useId } from 'react';
import { CHILI_PATH } from './Ornaments';

// A circular rubber "visa" stamp — inked in faded carmine, slightly rotated,
// blended onto the paper with multiply so it looks pressed on.

export default function StampSeal({
  date,
  size = 140,
  rotate = -11,
  top = 'LA MAS BRAVA',
  bottom = '★ PROBADO ★',
  className = '',
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={`stamp ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-label={`Sello: probado ${date}`}
      role="img"
    >
      <g fill="none" stroke="currentColor">
        <circle cx="80" cy="80" r="76" strokeWidth="3" />
        <circle cx="80" cy="80" r="70" strokeWidth="1.3" />
        <circle cx="80" cy="80" r="42" strokeWidth="1.1" strokeDasharray="2 3.5" />
      </g>

      {/* curved text paths: over the top, under the bottom */}
      <path id={`st${id}`} d="M 24 80 A 56 56 0 1 1 136 80" fill="none" />
      <path id={`sb${id}`} d="M 22 80 A 58 58 0 0 0 138 80" fill="none" />

      <text fill="currentColor" fontFamily="Cinzel, serif" fontSize="12.5" fontWeight="700" letterSpacing="2.6">
        <textPath href={`#st${id}`} startOffset="50%" textAnchor="middle">{top}</textPath>
      </text>
      <text fill="currentColor" fontFamily="Cinzel, serif" fontSize="11.5" fontWeight="700" letterSpacing="3">
        <textPath href={`#sb${id}`} startOffset="50%" textAnchor="middle">{bottom}</textPath>
      </text>

      <text
        x="80" y="78"
        fill="currentColor"
        fontFamily="Cinzel, serif"
        fontSize="14"
        fontWeight="800"
        letterSpacing="1.5"
        textAnchor="middle"
      >
        {date}
      </text>
      <path d={CHILI_PATH} fill="currentColor" transform="translate(69, 84) scale(1.05)" />
    </svg>
  );
}
