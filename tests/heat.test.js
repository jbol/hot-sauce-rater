// Unit tests for the shared fire-scale utilities (pure ESM, no DOM).

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HEAT_LEVELS, heatCategory, heatColor, byHeat,
  formatDate, formatScoville, todayIso,
} from '../src/utils/heat.js';

test('heatCategory maps the 1–10 scale onto the five named levels', () => {
  assert.equal(heatCategory(1).key, 'suave');
  assert.equal(heatCategory(2).key, 'suave');
  assert.equal(heatCategory(3).key, 'templado');
  assert.equal(heatCategory(6).key, 'picante');
  assert.equal(heatCategory(7).key, 'ardiente');
  assert.equal(heatCategory(10).key, 'infierno');
  assert.equal(HEAT_LEVELS.length, 5);
});

test('byHeat orders by heat, then scoville (unknown first), then name', () => {
  const sorted = [
    { name: 'Cola', heat: 7, scoville: 5000 },
    { name: 'Beta', heat: 2, scoville: null },
    { name: 'Alfa', heat: 2, scoville: null },
    { name: 'Nulo', heat: 7, scoville: null },
    { name: 'Bajo', heat: 7, scoville: 100 },
  ].sort(byHeat);
  assert.deepEqual(sorted.map((s) => s.name), ['Alfa', 'Beta', 'Nulo', 'Bajo', 'Cola']);
});

test('heatColor ramps from gold to carmine', () => {
  assert.equal(heatColor(0), 'rgb(217, 164, 65)', 'first blade is the gold stop');
  assert.equal(heatColor(9), 'rgb(122, 20, 30)', 'last blade is the carmine stop');
  assert.match(heatColor(5), /^rgb\(\d+, \d+, \d+\)$/);
});

test('formatDate renders passport-style Spanish dates', () => {
  assert.equal(formatDate('2026-07-04'), '04 JUL 2026');
  assert.equal(formatDate('2026-06-13 12:00:00'), '13 JUN 2026', 'SQLite timestamps work too');
  assert.equal(formatDate(null), '—');
  assert.equal(formatDate('garbage'), '—');
});

test('formatScoville formats SHU or passes null through', () => {
  assert.equal(formatScoville(135600), '135,600 SHU');
  assert.equal(formatScoville(0), '0 SHU');
  assert.equal(formatScoville(null), null);
  assert.equal(formatScoville(undefined), null);
});

test('todayIso is a valid YYYY-MM-DD', () => {
  assert.match(todayIso(), /^\d{4}-\d{2}-\d{2}$/);
});
