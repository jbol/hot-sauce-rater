// Quick-add catalogue: 50+ widely known hot sauces used ONLY to prefill the
// entry form (name/brand/origin/peppers, approximate Scoville, and a
// *suggested* 1–10 heat). Entries remain user-owned rows — nothing in the app
// references catalogue ids, and every prefilled field stays editable.
//
// Scoville figures are commonly cited approximations (midpoints of ranges);
// `heat` is a reasonable starting suggestion on the passport's 1–10 scale.

export const CATALOGUE = [
  // ── Louisiana & US classics ────────────────────────────────────────────────
  { name: "Frank's RedHot Original",        brand: "Frank's",            origin: 'Louisiana-style, USA',   peppers: 'Cayenne',                 heat: 2,  scoville: 450 },
  { name: 'Crystal Hot Sauce',              brand: 'Baumer Foods',       origin: 'New Orleans, USA',       peppers: 'Cayenne',                 heat: 2,  scoville: 2500 },
  { name: 'Louisiana Original',             brand: 'Louisiana Brand',    origin: 'Louisiana, USA',         peppers: 'Cayenne',                 heat: 1,  scoville: 450 },
  { name: 'Texas Pete Original',            brand: 'TW Garner',          origin: 'North Carolina, USA',    peppers: 'Cayenne',                 heat: 2,  scoville: 750 },
  { name: "Trappey's Bull",                 brand: "Trappey's",          origin: 'Louisiana, USA',         peppers: 'Cayenne',                 heat: 2,  scoville: 1600 },
  { name: 'Red Rooster',                    brand: 'Bruce Foods',        origin: 'Louisiana, USA',         peppers: 'Cayenne',                 heat: 1,  scoville: 600 },
  { name: 'Tabasco Original',               brand: 'McIlhenny Co.',      origin: 'Avery Island, USA',      peppers: 'Tabasco',                 heat: 3,  scoville: 3750 },
  { name: 'Tabasco Green Jalapeño',         brand: 'McIlhenny Co.',      origin: 'Avery Island, USA',      peppers: 'Jalapeño',                heat: 1,  scoville: 800 },
  { name: 'Tabasco Chipotle',               brand: 'McIlhenny Co.',      origin: 'Avery Island, USA',      peppers: 'Chipotle',                heat: 2,  scoville: 1750 },
  { name: 'Tabasco Habanero',               brand: 'McIlhenny Co.',      origin: 'Avery Island, USA',      peppers: 'Habanero',                heat: 6,  scoville: 7000 },
  { name: 'Tabasco Scorpion',               brand: 'McIlhenny Co.',      origin: 'Avery Island, USA',      peppers: 'Trinidad Scorpion',       heat: 8,  scoville: 50000 },

  // ── México ────────────────────────────────────────────────────────────────
  { name: 'Cholula Original',               brand: 'Cholula',            origin: 'Jalisco, México',        peppers: 'Pequín, Árbol',           heat: 2,  scoville: 1500 },
  { name: 'Tapatío',                        brand: 'Tapatío Foods',      origin: 'California, USA',        peppers: 'Chile rojo',              heat: 3,  scoville: 3000 },
  { name: 'Valentina Amarilla',             brand: 'Salsa Tamazula',     origin: 'Guadalajara, México',    peppers: 'Puya',                    heat: 2,  scoville: 900 },
  { name: 'Valentina Negra (Extra Hot)',    brand: 'Salsa Tamazula',     origin: 'Guadalajara, México',    peppers: 'Puya, Árbol',             heat: 3,  scoville: 2100 },
  { name: 'Búfalo Clásica',                 brand: 'Herdez',             origin: 'México',                 peppers: 'Guajillo',                heat: 2,  scoville: 800 },
  { name: 'Salsa Huichol',                  brand: 'Casa Huichol',       origin: 'Nayarit, México',        peppers: 'Cascabel',                heat: 4,  scoville: 5000 },
  { name: 'El Yucateco Verde',              brand: 'El Yucateco',        origin: 'Yucatán, México',        peppers: 'Habanero verde',          heat: 6,  scoville: 6000 },
  { name: 'El Yucateco Rojo',               brand: 'El Yucateco',        origin: 'Yucatán, México',        peppers: 'Habanero rojo',           heat: 6,  scoville: 5790 },
  { name: 'El Yucateco Kutbil-Ik XXXtra',   brand: 'El Yucateco',        origin: 'Yucatán, México',        peppers: 'Habanero maya',           heat: 7,  scoville: 11600 },

  // ── Asia ──────────────────────────────────────────────────────────────────
  { name: 'Sriracha',                       brand: 'Huy Fong Foods',     origin: 'California, USA',        peppers: 'Jalapeño rojo',           heat: 3,  scoville: 2200 },
  { name: 'Chili Garlic Sauce',             brand: 'Huy Fong Foods',     origin: 'California, USA',        peppers: 'Chile rojo, ajo',         heat: 3,  scoville: 2200 },
  { name: 'Sambal Oelek',                   brand: 'Huy Fong Foods',     origin: 'California, USA',        peppers: 'Chile rojo',              heat: 3,  scoville: 2000 },
  { name: 'Flying Goose Sriracha',          brand: 'Flying Goose',       origin: 'Tailandia',              peppers: 'Chile rojo',              heat: 3,  scoville: 2200 },
  { name: 'Sriraja Panich',                 brand: 'Thaitheparos',       origin: 'Si Racha, Tailandia',    peppers: 'Chile espuela',           heat: 2,  scoville: 1600 },
  { name: "Lingham's Original",             brand: "Lingham's",          origin: 'Malasia',                peppers: 'Chile rojo',              heat: 2,  scoville: 1000 },

  // ── Caribbean & Central America ───────────────────────────────────────────
  { name: "Marie Sharp's Habanero",         brand: "Marie Sharp's",      origin: 'Belice',                 peppers: 'Habanero rojo',           heat: 5,  scoville: 5000 },
  { name: "Melinda's Original Habanero",    brand: "Melinda's",          origin: 'Colombia',               peppers: 'Habanero',                heat: 5,  scoville: 5000 },
  { name: "Melinda's Ghost Pepper",         brand: "Melinda's",          origin: 'Colombia',               peppers: 'Ghost pepper',            heat: 8,  scoville: 47000 },
  { name: 'Encona West Indian',             brand: 'Encona',             origin: 'Caribe / Reino Unido',   peppers: 'Scotch Bonnet',           heat: 7,  scoville: 12000 },
  { name: 'Grace Very Hot Pepper Sauce',    brand: 'Grace',              origin: 'Jamaica',                peppers: 'Scotch Bonnet',           heat: 8,  scoville: 50000 },
  { name: 'Pickapeppa Original',            brand: 'Pickapeppa',         origin: 'Jamaica',                peppers: 'Pimientos añejados',      heat: 1,  scoville: 500 },
  { name: "Matouk's West Indian",           brand: "Matouk's",           origin: 'Trinidad y Tobago',      peppers: 'Scotch Bonnet',           heat: 6,  scoville: 8000 },
  { name: 'Baron West Indian Hot Sauce',    brand: 'Baron Foods',        origin: 'Santa Lucía',            peppers: 'Scotch Bonnet',           heat: 5,  scoville: 8000 },

  // ── US craft & Hot Ones favourites ────────────────────────────────────────
  { name: 'Secret Aardvark Habanero',       brand: 'Secret Aardvark',    origin: 'Portland, USA',          peppers: 'Habanero, tomate',        heat: 5,  scoville: 5000 },
  { name: 'Yellowbird Habanero',            brand: 'Yellowbird',         origin: 'Austin, USA',            peppers: 'Habanero',                heat: 7,  scoville: 10800 },
  { name: 'Yellowbird Serrano',             brand: 'Yellowbird',         origin: 'Austin, USA',            peppers: 'Serrano',                 heat: 6,  scoville: 8500 },
  { name: 'Truff Original',                 brand: 'Truff',              origin: 'California, USA',        peppers: 'Chile rojo, trufa negra', heat: 3,  scoville: 2500 },
  { name: 'Queen Majesty Scotch Bonnet & Ginger', brand: 'Queen Majesty', origin: 'Queens, USA',           peppers: 'Scotch Bonnet',           heat: 6,  scoville: 9000 },
  { name: 'Heartbeat Pineapple Habanero',   brand: 'Heartbeat',          origin: 'Ontario, Canadá',        peppers: 'Habanero',                heat: 6,  scoville: 8500 },
  { name: 'Los Calientes Rojo',             brand: 'Heatonist',          origin: 'Brooklyn, USA',          peppers: 'Habanero, chipotle',      heat: 7,  scoville: 36000 },
  { name: 'Hot Ones — The Classic',         brand: 'Heatonist',          origin: 'Brooklyn, USA',          peppers: 'Chile de árbol',          heat: 3,  scoville: 1800 },
  { name: 'The Last Dab: Apollo',           brand: 'Heatonist',          origin: 'Brooklyn, USA',          peppers: 'Pepper X (Apollo)',       heat: 10, scoville: 1000000 },

  // ── The deep end ──────────────────────────────────────────────────────────
  { name: 'Da Bomb Beyond Insanity',        brand: 'Da Bomb',            origin: 'Kansas, USA',            peppers: 'Habanero, extracto',      heat: 10, scoville: 135600 },
  { name: "Dave's Insanity Sauce",          brand: "Dave's Gourmet",     origin: 'California, USA',        peppers: 'Extracto de capsaicina',  heat: 10, scoville: 180000 },
  { name: 'Mad Dog 357',                    brand: 'Ashley Food Co.',    origin: 'Massachusetts, USA',     peppers: 'Extracto de capsaicina',  heat: 10, scoville: 357000 },
  { name: "Blair's After Death",            brand: "Blair's",            origin: 'New Jersey, USA',        peppers: 'Habanero, extracto',      heat: 9,  scoville: 50000 },
  { name: 'Torchbearer Zombie Apocalypse',  brand: 'Torchbearer',        origin: 'Pennsylvania, USA',      peppers: 'Ghost pepper, habanero',  heat: 9,  scoville: 100000 },
  { name: 'Reaper Squeezins',               brand: 'PuckerButt',         origin: 'South Carolina, USA',    peppers: 'Carolina Reaper',         heat: 10, scoville: 1000000 },

  // ── Africa & Europe ───────────────────────────────────────────────────────
  { name: 'Nando’s Peri-Peri Hot',          brand: 'Nando’s',            origin: 'Sudáfrica',              peppers: 'African Bird’s Eye',      heat: 4,  scoville: 3000 },
  { name: 'Nando’s Peri-Peri Extra Hot',    brand: 'Nando’s',            origin: 'Sudáfrica',              peppers: 'African Bird’s Eye',      heat: 5,  scoville: 4500 },
  { name: 'Akabanga',                       brand: 'Sina Gérard',        origin: 'Ruanda',                 peppers: 'Bird’s eye (aceite)',     heat: 9,  scoville: 150000 },
  { name: 'Reggae Reggae Sauce',            brand: 'Levi Roots',         origin: 'Reino Unido',            peppers: 'Scotch Bonnet',           heat: 2,  scoville: 1500 },
  { name: 'Espinaler Salsa Picante',        brand: 'Espinaler',          origin: 'Barcelona, España',      peppers: 'Cayena',                  heat: 1,  scoville: 900 },
];

// Diacritic-insensitive fold: "jalapeño" matches "jalapeno" and vice versa.
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Prefix matches on the sauce name rank first, then anything containing the
// query in "name brand". Needs ≥2 characters.
export function searchCatalogue(query, limit = 8) {
  const q = fold(String(query ?? '').trim());
  if (q.length < 2) return [];
  const starts = [];
  const contains = [];
  for (const sauce of CATALOGUE) {
    const name = fold(sauce.name);
    const hay = `${name} ${fold(sauce.brand)}`;
    if (name.startsWith(q)) starts.push(sauce);
    else if (hay.includes(q)) contains.push(sauce);
  }
  return [...starts, ...contains].slice(0, limit);
}
