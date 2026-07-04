// The passport's fire scale: 1–10, grouped into five named levels that map
// onto the fan gauge and the coloured category chips.

export const HEAT_LEVELS = [
  { max: 2,  key: 'suave',    es: 'SUAVE',    en: 'Mild' },
  { max: 4,  key: 'templado', es: 'TEMPLADO', en: 'Warm' },
  { max: 6,  key: 'picante',  es: 'PICANTE',  en: 'Hot' },
  { max: 8,  key: 'ardiente', es: 'ARDIENTE', en: 'Fiery' },
  { max: 10, key: 'infierno', es: 'INFIERNO', en: 'Inferno' },
];

export const heatCategory = (heat) =>
  HEAT_LEVELS.find((l) => heat <= l.max) ?? HEAT_LEVELS[HEAT_LEVELS.length - 1];

// Fan-blade colour ramp: gold → burnt orange → deep carmine.
const STOPS = [
  [217, 164, 65],
  [186, 84, 38],
  [122, 20, 30],
];

export function heatColor(index, total = 10) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const seg = t <= 0.5 ? 0 : 1;
  const localT = (t - seg * 0.5) * 2;
  const [r1, g1, b1] = STOPS[seg];
  const [r2, g2, b2] = STOPS[seg + 1];
  const mix = (a, b) => Math.round(a + (b - a) * localT);
  return `rgb(${mix(r1, r2)}, ${mix(g1, g2)}, ${mix(b1, b2)})`;
}

// Passport pages run least → most spicy.
export const byHeat = (a, b) =>
  a.heat - b.heat ||
  (a.scoville ?? -1) - (b.scoville ?? -1) ||
  a.name.localeCompare(b.name);

const MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Accepts 'YYYY-MM-DD' or SQLite's 'YYYY-MM-DD HH:MM:SS' → '03 JUL 2026'
export function formatDate(value) {
  if (!value) return '—';
  const iso = String(value).includes(' ') ? value.replace(' ', 'T') + 'Z' : `${value}T00:00:00`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

export const formatScoville = (n) =>
  n === null || n === undefined ? null : `${n.toLocaleString('en-US')} SHU`;

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
