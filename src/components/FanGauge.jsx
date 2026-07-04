import { heatColor } from '../utils/heat';

// A Spanish folding fan (abanico) as a heat gauge: 10 blades, opened
// left-to-right up to the current heat. Also doubles as the heat picker in
// the entry form (pass onSelect/onPreview) and as a gold emblem (palette).

const rad = (deg) => (deg * Math.PI) / 180;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
const f = (n) => n.toFixed(2);

const CX = 60;
const CY = 78;
const R_OUT = 58;
const R_IN = 15;
const BLADES = 10;

function bladePath(a0, a1, rIn = R_IN, rOut = R_OUT) {
  const [x1, y1] = pt(CX, CY, rIn, a0);
  const [x2, y2] = pt(CX, CY, rOut, a0);
  const [x3, y3] = pt(CX, CY, rOut, a1);
  const [x4, y4] = pt(CX, CY, rIn, a1);
  return (
    `M ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)} ` +
    `A ${rOut} ${rOut} 0 0 1 ${f(x3)} ${f(y3)} ` +
    `L ${f(x4)} ${f(y4)} A ${rIn} ${rIn} 0 0 0 ${f(x1)} ${f(y1)} Z`
  );
}

// Blade i spans [170 - i·16, 170 - i·16 - 14] degrees (2° gap between blades).
const bladeAngles = (i) => [170 - i * 16, 170 - i * 16 - 14];

const goldColor = (i) => {
  const t = i / (BLADES - 1);
  const mix = (a, b) => Math.round(a + (b - a) * t);
  return `rgb(${mix(233, 176)}, ${mix(200, 130)}, ${mix(122, 48)})`;
};

export default function FanGauge({
  heat = 0,
  size = 120,
  palette = 'heat',      // 'heat' → gold→carmine ramp · 'gold' → embossed gold
  showGuards = true,
  onSelect,
  onPreview,
  className = '',
  ariaLabel,
}) {
  const interactive = typeof onSelect === 'function';
  const height = (size * 88) / 120;

  return (
    <svg
      viewBox="0 0 120 88"
      width={size}
      height={height}
      className={`fan-gauge ${className}`}
      role={interactive ? undefined : 'img'}
      aria-label={ariaLabel ?? `Fuego ${heat} de ${BLADES}`}
    >
      {/* blades */}
      {Array.from({ length: BLADES }, (_, i) => {
        const [a0, a1] = bladeAngles(i);
        const open = i < heat;
        const fill = open
          ? palette === 'gold' ? goldColor(i) : heatColor(i)
          : 'rgba(120, 96, 56, 0.13)';
        return (
          <path
            key={i}
            d={bladePath(a0, a1)}
            fill={fill}
            stroke={open ? 'rgba(58, 32, 20, 0.35)' : 'rgba(120, 96, 56, 0.35)'}
            strokeWidth="0.7"
          />
        );
      })}

      {/* guard sticks framing the fan */}
      {showGuards && (
        <g stroke={palette === 'gold' ? '#8a6420' : '#6d4a2f'} strokeWidth="3" strokeLinecap="round">
          <line x1={f(pt(CX, CY, 5, 174)[0])} y1={f(pt(CX, CY, 5, 174)[1])} x2={f(pt(CX, CY, R_OUT + 2, 174)[0])} y2={f(pt(CX, CY, R_OUT + 2, 174)[1])} />
          <line x1={f(pt(CX, CY, 5, 8)[0])} y1={f(pt(CX, CY, 5, 8)[1])} x2={f(pt(CX, CY, R_OUT + 2, 8)[0])} y2={f(pt(CX, CY, R_OUT + 2, 8)[1])} />
        </g>
      )}

      {/* rivet + tassel */}
      <circle cx={CX} cy={CY} r="4" fill="#c9962b" stroke="#5c3a17" strokeWidth="1" />
      <line x1={CX} y1={CY + 4} x2={CX} y2={CY + 8} stroke="#8a6420" strokeWidth="1.2" />
      <circle cx={CX} cy={CY + 9.5} r="1.6" fill="#8a6420" />

      {/* enlarged invisible hit wedges for picking */}
      {interactive &&
        Array.from({ length: BLADES }, (_, i) => {
          const a0 = 170 - i * 16;
          return (
            <path
              key={`hit-${i}`}
              d={bladePath(a0, a0 - 16, 6, R_OUT + 6)}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelect(i + 1)}
              onMouseEnter={onPreview ? () => onPreview(i + 1) : undefined}
              onMouseLeave={onPreview ? () => onPreview(null) : undefined}
            >
              <title>{`Fuego ${i + 1} / ${BLADES}`}</title>
            </path>
          );
        })}
    </svg>
  );
}
