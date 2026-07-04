import { useId } from 'react';
import FanGauge from './FanGauge';

// Shared decorative pieces for the passport: Andalusian tile strips,
// chili glyphs, gold dividers, and the cover emblem.

export const CHILI_PATH =
  'M16.2 5.9c2.3 1.1 3.4 3.7 2.5 6.3-1.3 3.7-5.6 6.4-10.3 6.9-2.8.3-5-.7-5.7-2-.3-.6.2-1.2.9-1 3.9.7 8.7-1.4 10.5-5 .8-1.6 1-3.3.6-4.6-.2-.7.8-1 1.5-.6z';

export const CHILI_STEM_PATH =
  'M15.4 6.2c.1-1.9 1.3-3.3 3.2-3.8-.5 1.2-.6 2.3-.3 3.5-.9.6-1.9.7-2.9.3z';

export function ChiliIcon({ size = 20, color = 'currentColor', stem = '#6b7a3a', className = '' }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} aria-hidden="true">
      <path d={CHILI_PATH} fill={color} />
      <path d={CHILI_STEM_PATH} fill={stem} />
    </svg>
  );
}

// A strip of Andalusian star-tile pattern, used as page headers.
export function AzulejoStrip({ height = 16, className = '' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg className={`azulejo ${className}`} height={height} width="100%" aria-hidden="true">
      <defs>
        <pattern id={`az${id}`} patternUnits="userSpaceOnUse" width="18" height="18">
          <rect width="18" height="18" fill="#f1e4c8" />
          <path d="M9 1.8 L16.2 9 L9 16.2 L1.8 9 Z" fill="none" stroke="#c9962b" strokeWidth="1.1" />
          <circle cx="9" cy="9" r="2.4" fill="#a4243b" />
          <circle cx="0" cy="0" r="2" fill="#2a1a14" />
          <circle cx="18" cy="0" r="2" fill="#2a1a14" />
          <circle cx="0" cy="18" r="2" fill="#2a1a14" />
          <circle cx="18" cy="18" r="2" fill="#2a1a14" />
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#az${id})`} />
      <rect x="0" y="0" width="100%" height="1" fill="#8a6420" opacity="0.55" />
      <rect x="0" y={height - 1} width="100%" height="1" fill="#8a6420" opacity="0.55" />
    </svg>
  );
}

// Gold rule with a tile diamond at the centre.
export function Divider({ className = '' }) {
  return (
    <div className={`divider ${className}`} aria-hidden="true">
      <svg viewBox="0 0 34 14" width="34" height="14">
        <path d="M17 1.5 L22.5 7 L17 12.5 L11.5 7 Z" fill="none" stroke="#c9962b" strokeWidth="1.2" />
        <circle cx="17" cy="7" r="1.8" fill="#a4243b" />
        <circle cx="5" cy="7" r="1.4" fill="#c9962b" />
        <circle cx="29" cy="7" r="1.4" fill="#c9962b" />
      </svg>
    </div>
  );
}

// The front-cover emblem: a flamenca in the classic pose — open fan held
// aloft, head in profile with lifted chin, the other hand pulling the
// flounced hem up to one side, heeled shoe showing beneath. Body renders in
// currentColor (gold on the leather); the fan and flounce take the accent
// colour, edged in gold, echoing the black-and-red silhouette it's based on.
export function DancerEmblem({ size = 190, className = '', accent = '#a4243b' }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden="true">
      {/* ring */}
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="89" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
      <path d="M100 8 L103 15 L100 22 L97 15 Z" fill="currentColor" />
      <path d="M8 100 L15 97 L22 100 L15 103 Z" fill="currentColor" />
      <path d="M178 100 L185 97 L192 100 L185 103 Z" fill="currentColor" />

      {/* open fan, held aloft — accent leaf edged in gold, slats + rivet */}
      <path
        d="M74 57 L 48.9 62.7 A 26 26 0 0 1 92.4 37.6 Z"
        fill={accent} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"
      />
      <g stroke="currentColor" strokeWidth="0.9" opacity="0.85">
        <line x1="74" y1="57" x2="53.5" y2="47.5" />
        <line x1="74" y1="57" x2="63" y2="35.5" />
        <line x1="74" y1="57" x2="82" y2="33.5" />
      </g>
      <circle cx="74" cy="57" r="2.6" fill="currentColor" />

      {/* raised arm to the fan */}
      <path
        d="M92 81 C 84 76, 78 68, 75 59"
        fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round"
      />

      {/* head in profile, chin lifted; chignon at the nape; long neck */}
      <ellipse cx="102" cy="60" rx="7.2" ry="8.2" fill="currentColor" transform="rotate(16 102 60)" />
      <path d="M105 52 C 111 55, 114.5 60, 113.5 64.5 L 104 69 Z" fill="currentColor" />
      <circle cx="92.5" cy="66.5" r="4.6" fill="currentColor" />
      <path d="M97 67 L 104 65 C 104 71, 105 75, 107 79 L 93 82 C 95.5 77, 96.8 72, 97 67 Z" fill="currentColor" />

      {/* fitted torso, bust and waist */}
      <path
        d="M90 80 C 88 92, 90 102, 94 112 C 91 120, 89 126, 88 132
           L 114 132 C 113 124, 110 116, 108 108 C 112 98, 110 86, 104 79
           C 99 76, 93 77, 90 80 Z"
        fill="currentColor"
      />

      {/* back arm reaching down; the hand merges into the hem gather */}
      <path
        d="M103 81 C 112 87, 118 96, 120 106 C 120.8 112, 121.5 118, 122 123"
        fill="none" stroke="currentColor" strokeWidth="5.2" strokeLinecap="round"
      />
      <circle cx="122" cy="124" r="3.2" fill="currentColor" />

      {/* standing leg + heeled shoe under the lifted side of the hem,
          drawn first so skirt & flounce overlap the thigh */}
      <path d="M108.5 152 L 107 169" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" fill="none" />
      <path
        d="M102.5 170 C 102.5 167.6, 104.9 166.4, 107.6 166.4
           C 112 166.4, 116.4 168.5, 119.6 171.5
           C 121.3 173.1, 121.3 174.8, 119.6 175.7
           L 103.5 175.7 Z
           M 103.5 175.7 L 102.8 182.6 L 107.2 182.6 L 107.6 175.7 Z"
        fill="currentColor"
      />

      {/* long skirt: fitted through the hip, sweeping to the floor at left,
          hem rising to the lifting hand at right */}
      <path
        d="M88 132 C 83 147, 73 161, 60 172
           C 79 167, 94 159, 104 151
           C 112 145, 118 138, 121 130
           C 121.4 128, 121.7 126, 122 124
           C 119 127, 116.5 130, 114 132 Z"
        fill="currentColor"
      />

      {/* flounce: ruffled cascade along the lifted hem — deep under the hand,
          tapering toward the floor at left */}
      <path
        d="M60 172
           C 79 167, 94 159, 104 151
           C 112 145, 118 138, 121 130
           C 125 133, 129 138.5, 131 144
           Q 129 154, 120 152
           Q 117 161, 109 158.5
           Q 104 169.5, 95 168
           Q 91.5 177, 81 173
           Q 77.5 181, 67 176
           Q 65 181, 56.5 175.5
           C 57.5 174, 58.6 172.6, 60 172 Z"
        fill={accent} stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
    </svg>
  );
}

// The gold cover emblem: ringed fan with a chili beneath.
export function FanEmblem({ size = 190, className = '' }) {
  return (
    <div className={`fan-emblem ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="fan-emblem-ring">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="89" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
        <path d="M100 8 L103 15 L100 22 L97 15 Z" fill="currentColor" />
        <path d="M100 178 L103 185 L100 192 L97 185 Z" fill="currentColor" />
        <path d="M8 100 L15 97 L22 100 L15 103 Z" fill="currentColor" />
        <path d="M178 100 L185 97 L192 100 L185 103 Z" fill="currentColor" />
      </svg>
      <FanGauge heat={10} palette="gold" size={size * 0.66} className="fan-emblem-fan" />
      <svg viewBox="0 0 20 20" width={size * 0.24} className="fan-emblem-chili">
        <path d={CHILI_PATH} fill="currentColor" />
        <path d={CHILI_STEM_PATH} fill="currentColor" opacity="0.7" />
      </svg>
    </div>
  );
}
