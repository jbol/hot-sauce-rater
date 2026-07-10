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

// Security-print lattice for the passport linings: interlaced sine "braids"
// tiled like engraved guilloché work, in fine gold lines on the carmine.
export function GuillochePattern({ className = '', stroke = '#e9c877', opacity = 0.3 }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const braid = 'M0 0 C 16 -18, 48 18, 64 0 M0 0 C 16 18, 48 -18, 64 0';
  return (
    <svg className={`guilloche ${className}`} aria-hidden="true">
      <defs>
        <pattern id={`gu${id}`} patternUnits="userSpaceOnUse" width="64" height="24">
          <g fill="none" stroke={stroke} strokeWidth="0.7" opacity={opacity}>
            {/* braid rows at the tile's top and bottom edges (tiling joins them) */}
            <path d={braid} />
            <path d={braid} transform="translate(0 24)" />
            {/* half-offset middle row — two clipped segments cover the seam */}
            <path d={braid} transform="translate(-32 12)" />
            <path d={braid} transform="translate(32 12)" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#gu${id})`} />
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
