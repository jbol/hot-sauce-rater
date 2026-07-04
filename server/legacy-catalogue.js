// The static sauce catalogue that shipped with v2 (src/data/hotSauces.js).
// Kept server-side ONLY so the one-time startup migration in db.js can turn
// old `ratings` rows (which referenced these ids) into passport `entries`.
// The running app never reads this after that migration has completed.
//
// heat  : v2 heatLevel (1–5) mapped onto the passport's 1–10 fire scale (×2)
// scoville: midpoint of the v2 range string, as an integer

export const LEGACY_CATALOGUE = [
  { id: 1,  name: 'Sriracha',                 brand: 'Huy Fong',        origin: 'USA',    peppers: 'Red Jalapeño',        heat: 6,  scoville: 1750 },
  { id: 2,  name: 'Cholula Original',         brand: 'Cholula',         origin: 'Mexico', peppers: 'Pequin, Arbol',       heat: 4,  scoville: 1500 },
  { id: 3,  name: 'Tabasco Original',         brand: 'McIlhenny Co.',   origin: 'USA',    peppers: 'Tabasco',             heat: 4,  scoville: 3750 },
  { id: 4,  name: 'El Yucateco Green',        brand: 'El Yucateco',     origin: 'Mexico', peppers: 'Habanero',            heat: 8,  scoville: 5790 },
  { id: 5,  name: "Frank's RedHot",           brand: "Frank's",         origin: 'USA',    peppers: 'Cayenne',             heat: 4,  scoville: 450 },
  { id: 6,  name: 'Valentina Extra Hot',      brand: 'Valentina',       origin: 'Mexico', peppers: 'Puya, Arbol',         heat: 6,  scoville: 2100 },
  { id: 7,  name: 'Secret Aardvark Habanero', brand: 'Secret Aardvark', origin: 'USA',    peppers: 'Habanero',            heat: 6,  scoville: 3750 },
  { id: 8,  name: 'Da Bomb Beyond Insanity',  brand: 'Da Bomb',         origin: 'USA',    peppers: 'Habanero, Chipotle',  heat: 10, scoville: 135600 },
  { id: 9,  name: 'Crystal Hot Sauce',        brand: 'Crystal',         origin: 'USA',    peppers: 'Cayenne',             heat: 2,  scoville: 3000 },
  { id: 10, name: 'Yellowbird Habanero',      brand: 'Yellowbird',      origin: 'USA',    peppers: 'Habanero',            heat: 8,  scoville: 10800 },
  { id: 11, name: 'Tapatio',                  brand: 'Tapatio',         origin: 'USA',    peppers: 'Red Pepper',          heat: 4,  scoville: 3000 },
  { id: 12, name: "Marie Sharp's Habanero",   brand: "Marie Sharp's",   origin: 'Belize', peppers: 'Habanero',            heat: 8,  scoville: 75000 },
];
