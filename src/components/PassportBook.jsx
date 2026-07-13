import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEntries } from '../contexts/EntriesContext';
import EntryForm from './EntryForm';
import FanGauge from './FanGauge';
import {
  CoverPage, InsideCover, IdPage, IntroPage,
  SaucePage, AddPage, BlankPage, BackLining, BackCover,
} from './PassportPages';

const SINGLE_MQ = '(max-width: 860px)';

// Number of front-matter pages before the first sauce page:
// 0 cover · 1 inside lining · 2 id page · 3 fire-scale page → sauces start at 4.
const FIRST_SAUCE_PAGE = 4;

function buildPages({ user, entries, onOpen, onEdit, onDelete, onAdd, onToggleFavorite }) {
  const total = entries.length;
  const interior = [
    { key: 'id', type: 'paper', node: <IdPage user={user} entries={entries} /> },
    { key: 'intro', type: 'paper', node: <IntroPage /> },
    ...entries.map((entry, i) => ({
      key: `sauce-${entry.id}`,
      type: 'paper',
      node: (
        <SaucePage
          entry={entry}
          index={i}
          total={total}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ),
    })),
    { key: 'add', type: 'paper', node: <AddPage onAdd={onAdd} isEmpty={total === 0} /> },
  ];
  if (interior.length % 2) interior.push({ key: 'blank', type: 'paper', node: <BlankPage /> });

  return [
    { key: 'cover', type: 'cover', node: <CoverPage onOpen={onOpen} /> },
    { key: 'inside-cover', type: 'lining', node: <InsideCover userName={user.name} /> },
    ...interior,
    { key: 'back-lining', type: 'lining', node: <BackLining /> },
    { key: 'back-cover', type: 'cover', node: <BackCover /> },
  ];
}

export default function PassportBook() {
  const { user } = useAuth();
  const { entries, loading, error, addEntry, updateEntry, deleteEntry, toggleFavorite } = useEntries();

  const [flipped, setFlipped] = useState(0);        // sheets turned (desktop spread mode)
  const [prevFlipped, setPrevFlipped] = useState(0); // where the last turn started (riffle stagger)
  const [turnInfo, setTurnInfo] = useState(null);   // { index, dir } of a single-sheet turn
  const [singleIdx, setSingleIdx] = useState(0);    // current page (mobile single mode)
  const [single, setSingle] = useState(() => window.matchMedia(SINGLE_MQ).matches);
  const [form, setForm] = useState(null);           // null | { entry: object | null }
  const [pendingId, setPendingId] = useState(null); // entry to navigate to once saved
  const singleDirRef = useRef('fwd');               // last navigation direction (single mode)

  useEffect(() => {
    const mq = window.matchMedia(SINGLE_MQ);
    // Recheck on window resize too: some embedded/emulated viewports update
    // media evaluation without ever emitting matchMedia 'change' events.
    const onChange = () => setSingle(mq.matches);
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  const openForm = (entry = null) => setForm({ entry });

  const pages = buildPages({
    user,
    entries,
    onOpen: () => next(),
    onEdit: (entry) => openForm(entry),
    onDelete: deleteEntry,
    onAdd: () => openForm(null),
    onToggleFavorite: toggleFavorite,
  });
  const sheetCount = pages.length / 2;
  const sheets = [];
  for (let i = 0; i < pages.length; i += 2) sheets.push([pages[i], pages[i + 1]]);

  const turnTo = (target) => {
    const t = Math.max(0, Math.min(sheetCount, target));
    if (t === flipped) return;
    setPrevFlipped(flipped);
    // Single-step turns get the fancy lift+shade keyframes on the moving
    // sheet; multi-sheet jumps riffle via staggered transitions instead.
    setTurnInfo(
      Math.abs(t - flipped) === 1
        ? { index: Math.min(t, flipped), dir: t > flipped ? 'fwd' : 'back' }
        : null,
    );
    setFlipped(t);
  };

  const goToPageIdx = (idx) => {
    const i = Math.max(0, Math.min(pages.length - 1, idx));
    if (single) {
      singleDirRef.current = i >= singleIdx ? 'fwd' : 'back';
      setSingleIdx(i);
    } else {
      turnTo(Math.ceil(i / 2));
    }
  };

  function next() {
    if (single) {
      singleDirRef.current = 'fwd';
      setSingleIdx((i) => Math.min(pages.length - 1, i + 1));
    } else {
      turnTo(flipped + 1);
    }
  }
  function prev() {
    if (single) {
      singleDirRef.current = 'back';
      setSingleIdx((i) => Math.max(0, i - 1));
    } else {
      turnTo(flipped - 1);
    }
  }

  // Keyboard page-turning (disabled while the form is open).
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (form || e.defaultPrevented) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  };
  useEffect(() => {
    const handler = (e) => keyRef.current?.(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Keep positions valid when pages disappear (entry deleted).
  useEffect(() => {
    setFlipped((f) => Math.min(f, sheetCount));
    setSingleIdx((i) => Math.min(i, pages.length - 1));
  }, [sheetCount, pages.length]);

  // Keep roughly the same place when switching spread ↔ single layouts.
  const prevSingle = useRef(single);
  useEffect(() => {
    if (prevSingle.current === single) return;
    prevSingle.current = single;
    if (single) setSingleIdx(Math.min(pages.length - 1, flipped * 2));
    else setFlipped(Math.min(sheetCount, Math.ceil(singleIdx / 2)));
  }, [single]); // eslint-disable-line react-hooks/exhaustive-deps

  // After saving, flip to the page where the sauce landed (it may have moved —
  // pages are ordered by heat).
  useEffect(() => {
    if (pendingId === null) return;
    const idx = entries.findIndex((e) => e.id === pendingId);
    if (idx >= 0) goToPageIdx(FIRST_SAUCE_PAGE + idx);
    setPendingId(null);
  }, [entries, pendingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (values) => {
    const saved = form?.entry
      ? await updateEntry(form.entry.id, values)
      : await addEntry(values);
    setForm(null);
    setPendingId(saved.id);
  };

  // Swipe to flip on touch devices. The handlers only observe — no
  // preventDefault — so taps, buttons, and vertical scrolling keep working.
  // A swipe must be quick, mostly horizontal, and travel ≥48px; the time cap
  // keeps long-press text selections from turning pages on release.
  const touchRef = useRef(null);
  const handleTouchStart = (e) => {
    touchRef.current = e.touches.length === 1
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
      : null;
  };
  const handleTouchEnd = (e) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || form) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Date.now() - start.t > 600) return;
    if (Math.abs(dx) < 48 || Math.abs(dx) < 1.5 * Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (loading) {
    return (
      <div className="book-loading">
        <FanGauge heat={10} size={150} className="book-loading-fan" />
        <p>Abriendo el pasaporte…</p>
      </div>
    );
  }

  const atStart = single ? singleIdx === 0 : flipped === 0;
  const atEnd = single ? singleIdx === pages.length - 1 : flipped === sheetCount;
  const navLabel = atStart
    ? 'Toca la portada para abrir'
    : atEnd
      ? 'Fin del pasaporte'
      : single
        ? `página ${singleIdx + 1} de ${pages.length}`
        : `${flipped} / ${sheetCount}`;

  return (
    <div className="book-zone" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {error && <div className="book-error">{error}</div>}

      {single ? (
        <div className="book-single">
          <div
            key={pages[singleIdx].key}
            className={`single-page single-page-${singleDirRef.current} page-${pages[singleIdx].type}`}
          >
            {pages[singleIdx].node}
          </div>
        </div>
      ) : (
        <div className={`book ${flipped === 0 ? 'book-closed' : ''} ${flipped === sheetCount ? 'book-ended' : ''}`}>
          <div className="book-block">
            {sheets.map(([front, back], i) => {
              // Sheets get real 3D depth (translateZ per index) rather than
              // z-index: inside preserve-3d, coplanar siblings don't respect
              // z-index, so depth is what keeps the correct page on top of
              // each half of the open book.
              const turning = turnInfo?.index === i ? ` sheet-turn-${turnInfo.dir}` : '';
              // Multi-sheet jumps riffle: each moving sheet starts a beat
              // after the previous one, in the direction of travel.
              const lo = Math.min(prevFlipped, flipped);
              const hi = Math.max(prevFlipped, flipped);
              const riffling = hi - lo > 1 && i >= lo && i < hi;
              const delayMs = riffling ? (flipped > prevFlipped ? i - lo : hi - 1 - i) * 70 : 0;
              return (
                <div
                  key={front.key}
                  className={`sheet ${i < flipped ? 'sheet-flipped' : ''}${turning}`}
                  style={{ '--depth': `${-i * 1.5}px`, transitionDelay: `${delayMs}ms` }}
                >
                  <div className={`face face-front page-${front.type}`}>
                    {front.node}
                    <span className="page-gutter page-gutter-left" aria-hidden="true" />
                  </div>
                  <div className={`face face-back page-${back.type}`}>
                    {back.node}
                    <span className="page-gutter page-gutter-right" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="book-nav">
        <button className="nav-arrow" onClick={prev} disabled={atStart} aria-label="Página anterior">‹</button>
        <span className="book-nav-label">{navLabel}</span>
        <button className="nav-arrow" onClick={next} disabled={atEnd} aria-label="Página siguiente">›</button>
      </div>

      <button className="fab" onClick={() => openForm(null)}>
        <span className="fab-plus" aria-hidden="true">＋</span>
        <span>Nueva salsa</span>
      </button>

      {form && <EntryForm initial={form.entry} onSave={handleSave} onClose={() => setForm(null)} />}
    </div>
  );
}
