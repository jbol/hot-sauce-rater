// The quick-add catalogue: data integrity + search behavior.

import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE, searchCatalogue } from '../src/data/catalogue.js';

test('catalogue has at least 50 well-formed sauces', () => {
  assert.ok(CATALOGUE.length >= 50, `has ${CATALOGUE.length} sauces`);

  const names = new Set();
  for (const s of CATALOGUE) {
    assert.ok(s.name && s.brand && s.origin && s.peppers, `${s.name || '?'}: all text fields present`);
    assert.ok(Number.isInteger(s.heat) && s.heat >= 1 && s.heat <= 10, `${s.name}: heat on the 1–10 scale`);
    assert.ok(Number.isInteger(s.scoville) && s.scoville > 0, `${s.name}: positive integer scoville`);
    assert.ok(!names.has(s.name), `${s.name}: name is unique`);
    names.add(s.name);
  }
});

test('catalogue spans the whole fire scale', () => {
  const heats = new Set(CATALOGUE.map((s) => s.heat));
  assert.ok(heats.has(1), 'has suave sauces');
  assert.ok(heats.has(10), 'has inferno sauces');
});

test('search matches names and brands, name-prefix first', () => {
  const tabascos = searchCatalogue('tabas');
  assert.ok(tabascos.length >= 5, 'finds the Tabasco family');
  assert.ok(tabascos[0].name.startsWith('Tabasco'), 'prefix matches rank first');

  const byBrand = searchCatalogue('mcilhenny');
  assert.ok(byBrand.length >= 5, 'brand text matches too');
});

test('search is diacritic-insensitive both ways', () => {
  assert.ok(searchCatalogue('tapatio').some((s) => s.name === 'Tapatío'));
  assert.ok(searchCatalogue('bufalo').some((s) => s.name === 'Búfalo Clásica'));
  assert.ok(searchCatalogue('Búfa').some((s) => s.name === 'Búfalo Clásica'));
});

test('search needs two characters and caps its results', () => {
  assert.deepEqual(searchCatalogue(''), []);
  assert.deepEqual(searchCatalogue('t'), []);
  assert.ok(searchCatalogue('sa').length <= 8, 'default cap of 8');
  assert.ok(searchCatalogue('sa', 3).length <= 3, 'custom cap respected');
});
