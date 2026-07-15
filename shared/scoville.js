// The canonical Scoville → fire-scale mapping, shared by the server
// (validation + migrations) and the frontend (form derivation, catalogue).
// Pure ESM with zero dependencies so both sides can import it.
//
// Bands are anchored to well-known sauces (roughly logarithmic, like the
// scale itself): Frank's 450 → 1 · Sriracha 2,200 → 3 · Tabasco 3,750 → 4 ·
// El Yucateco 5,790 → 5 · Encona 12,000 → 6 · Los Calientes 36,000 → 7 ·
// Da Bomb 135,600 → 8 · Mad Dog 357,000 → 9 · The Last Dab 1,000,000 → 10.

export const SCOVILLE_BANDS = [
  { max: 700,      heat: 1 },
  { max: 1600,     heat: 2 },
  { max: 3000,     heat: 3 },
  { max: 5000,     heat: 4 },
  { max: 8000,     heat: 5 },
  { max: 15000,    heat: 6 },
  { max: 50000,    heat: 7 },
  { max: 150000,   heat: 8 },
  { max: 500000,   heat: 9 },
  { max: Infinity, heat: 10 },
];

export function heatFromScoville(shu) {
  return SCOVILLE_BANDS.find((band) => shu <= band.max).heat;
}
