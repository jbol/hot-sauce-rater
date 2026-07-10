import { useState } from 'react';
import FanGauge from './FanGauge';
import StampSeal from './StampSeal';
import StarRating from './StarRating';
import { AzulejoStrip, ChiliIcon, Divider, FanEmblem, GuillochePattern } from './Ornaments';
import { HEAT_LEVELS, heatCategory, formatDate, formatScoville } from '../utils/heat';

// Every page of the passport, front matter to back cover. Each is rendered
// inside a book "face" by PassportBook (or a single-page frame on mobile).

// ── helpers ──────────────────────────────────────────────────────────────────

const mrz = (s, len = 40) =>
  (s.toUpperCase().replace(/[ÁÀÄ]/g, 'A').replace(/[ÉÈË]/g, 'E').replace(/[ÍÌÏ]/g, 'I')
    .replace(/[ÓÒÖ]/g, 'O').replace(/[ÚÙÜ]/g, 'U').replace(/Ñ/g, 'N')
    .replace(/[^A-Z0-9]/g, '<') + '<'.repeat(len)).slice(0, len);

function rankTitle(count) {
  if (count >= 25) return { es: 'Leyenda del Infierno', en: 'Legend of the Inferno' };
  if (count >= 15) return { es: 'Maestro del Duende', en: 'Master of Duende' };
  if (count >= 8) return { es: 'Matador de Salsas', en: 'Sauce Matador' };
  if (count >= 4) return { es: 'Valiente del Fuego', en: 'Brave of the Fire' };
  if (count >= 1) return { es: 'Aficionado', en: 'Aficionado' };
  return { es: 'Novato del Fuego', en: 'Fire Novice' };
}

function PField({ label, sub, value, wide = false, n = null }) {
  return (
    <div className={`pfield ${wide ? 'pfield-wide' : ''}`}>
      <div className="pfield-label">
        {n !== null && `(${n}) `}{label} {sub && <i>{sub}</i>}
      </div>
      <div className="pfield-value">{value}</div>
    </div>
  );
}

// ── front / back matter ───────────────────────────────────────────────────────

export function CoverPage({ onOpen }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.();
    }
  };
  return (
    <div
      className="cover"
      onClick={onOpen}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label="Abrir el pasaporte"
    >
      <div className="cover-frame">
        <div className="cover-kicker">LA MAS BRAVA</div>
        <FanEmblem size={170} className="cover-emblem" />
        <h1 className="cover-title">PASAPORTE<br />PICANTE</h1>
        <div className="cover-sub">HOT SAUCE PASSPORT</div>
        <div className="cover-foot">· DE SUAVE A INFIERNO ·</div>
      </div>
    </div>
  );
}

export function InsideCover({ userName }) {
  return (
    <div className="lining">
      <GuillochePattern />
      <FanGauge heat={10} palette="gold" size={216} showGuards={false} className="lining-watermark" />
      <div className="lining-plaque">
        <div className="lining-plaque-text">Este pasaporte pertenece a</div>
        <div className="lining-plaque-sub">This passport belongs to</div>
        <div className="lining-plaque-name">{userName}</div>
      </div>
    </div>
  );
}

export function BackLining() {
  return (
    <div className="lining">
      <GuillochePattern />
      <FanGauge heat={10} palette="gold" size={170} showGuards={false} className="lining-watermark" />
      <div className="lining-plaque lining-plaque-small">
        <div className="lining-plaque-text">hecho con duende</div>
        <div className="lining-plaque-sub">made with duende</div>
      </div>
    </div>
  );
}

export function BackCover() {
  return (
    <div className="cover cover-back">
      <div className="cover-frame cover-frame-plain">
        <FanEmblem size={110} className="cover-emblem" />
        <div className="cover-foot">LA MAS BRAVA</div>
      </div>
    </div>
  );
}

// ── identification page ───────────────────────────────────────────────────────

export function IdPage({ user, entries }) {
  const count = entries.length;
  const hottest = count ? entries[count - 1] : null;
  const avg = count ? (entries.reduce((s, e) => s + e.heat, 0) / count).toFixed(1) : null;
  const rank = rankTitle(count);
  const passportNo = `LMB-${String(user.id).padStart(6, '0')}`;

  return (
    <div className="page-content id-page">
      <AzulejoStrip height={14} />
      <GuillochePattern stroke="#8e1f2c" opacity={0.055} />

      {/* country/document band, like the data page's header */}
      <header className="id-band">
        <span className="id-band-country">LA MAS BRAVA</span>
        <span className="id-band-doc">PASAPORTE <i>Passport · Passeport</i></span>
      </header>

      {/* Tipo / Código / Nº row */}
      <div className="id-toprow">
        <PField label="TIPO" sub="Type" value="P" />
        <PField label="CÓDIGO" sub="Code" value="LMB" />
        <PField label="PASAPORTE Nº" sub="Passport No" value={passportNo} />
      </div>

      <div className="id-body">
        <div className="id-portrait" aria-hidden="true">
          <ChiliIcon size={64} color="#8e1f2c" />
          <div className="id-portrait-caption">RETRATO OFICIAL</div>
        </div>

        <div className="id-grid">
          <PField n={1} label="NOMBRE" sub="Name · Nom" value={user.name} wide />
          <PField n={2} label="RANGO" sub="Rank · Rang" value={rank.es} />
          <PField n={3} label="TITULAR DESDE" sub="Member since" value={formatDate(user.created_at)} />
          <PField n={4} label="SELLOS" sub="Stamps" value={count} />
          <PField n={5} label="FUEGO MEDIO" sub="Avg" value={avg ?? '—'} />
          <PField n={6} label="MÁXIMA CONQUISTA" sub="Hottest conquered" value={hottest ? hottest.name : '—'} wide />
        </div>
      </div>

      <div className="id-bottomrow">
        <PField n={7} label="AUTORIDAD" sub="Authority · Autorité" value="LA MAS BRAVA" />
        <div className="pfield">
          <div className="pfield-label">(8) FIRMA DEL TITULAR <i>Signature</i></div>
          <div className="id-signature-name">{user.name}</div>
        </div>
      </div>

      {/* watermark emblem in the open field, like a held-to-light security mark */}
      <FanGauge heat={10} palette="gold" size={200} showGuards={false} className="id-watermark" />

      <div className="mrz" aria-hidden="true">
        <div>{mrz(`P<LMB${user.name}`)}</div>
        <div>{mrz(`${passportNo.replace('-', '')}7LMB<SELLOS<${count}<FUEGO<${avg ?? 0}`)}</div>
      </div>
    </div>
  );
}

// ── how-to page ───────────────────────────────────────────────────────────────

export function IntroPage() {
  return (
    <div className="page-content intro-page">
      <AzulejoStrip height={14} />
      <div className="page-heading">
        <div className="page-heading-title">LA ESCALA DE FUEGO <i>· The fire scale</i></div>
      </div>

      <p className="intro-text">
        Cada salsa probada queda sellada en una página de este pasaporte.
        Las páginas se ordenan de la más suave a la más infernal.
      </p>
      <p className="intro-text-en">
        Every sauce you try earns a stamped page, ordered from mildest to most infernal.
      </p>

      <Divider />

      <div className="intro-legend">
        {HEAT_LEVELS.map((l) => (
          <div key={l.key} className="intro-legend-row">
            <FanGauge heat={l.max} size={62} />
            <div className="intro-legend-names">
              <span className="intro-legend-es">{l.es}</span>
              <span className="intro-legend-en">{l.en}</span>
            </div>
            <span className={`heat-chip heat-${l.key}`}>{l.max - 1}–{l.max}</span>
          </div>
        ))}
      </div>

      <p className="intro-fineprint">
        El abanico se abre con el fuego — cuando las diez varillas se despliegan, has llegado al infierno.
      </p>
    </div>
  );
}

// ── a sauce page (one "visa" per sauce) ───────────────────────────────────────

export function SaucePage({ entry, index, total, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const cat = heatCategory(entry.heat);
  const stampRotation = ((entry.id * 37) % 17) - 8;

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(entry.id);
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="page-content sauce-page">
      <AzulejoStrip height={12} />
      <div className="sauce-eyebrow">
        <span>VISA DE FUEGO · Nº {index + 1} DE {total}</span>
        <span className={`heat-chip heat-${cat.key}`}>{cat.es}</span>
      </div>

      <div className="sauce-title-block">
        <h3 className="sauce-name">{entry.name}</h3>
        {entry.brand && <div className="sauce-brand">por {entry.brand}</div>}
      </div>

      <div className="sauce-body">
        <div className="sauce-fields">
          <PField label="ORIGEN" sub="Origin" value={entry.origin || '—'} />
          <PField label="CHILES" sub="Peppers" value={entry.peppers || '—'} />
          <PField label="FECHA" sub="Date tried" value={formatDate(entry.triedOn)} />
          <PField label="SCOVILLE" sub="Heat units" value={formatScoville(entry.scoville) ?? '—'} />
        </div>
        <div className="sauce-fire">
          <FanGauge heat={entry.heat} size={128} />
          <div className="sauce-fire-num">
            {entry.heat}<span>/10</span>
          </div>
          <div className="sauce-fire-name">{cat.es} · {cat.en}</div>
        </div>
      </div>

      <div className="sauce-rating">
        <span className="pfield-label">PUNTUACIÓN <i>Rating</i></span>
        <StarRating value={entry.rating ?? 0} size={18} />
      </div>

      <div className="sauce-notes">
        <span className="pfield-label">NOTAS <i>Tasting notes</i></span>
        <p className="sauce-notes-text">{entry.notes || '— sin notas —'}</p>
      </div>

      <StampSeal date={formatDate(entry.triedOn)} size={112} rotate={stampRotation} className="sauce-stamp" />

      <div className="sauce-footer">
        <span>de suave a infierno</span>
        <ChiliIcon size={13} color="#a4243b" stem="#6b7a3a" />
      </div>

      <div className="page-actions">
        <button className="page-action" onClick={() => onEdit(entry)} title="Enmendar registro · Edit" aria-label={`Editar ${entry.name}`}>
          ✎
        </button>
        <button className="page-action" onClick={() => setConfirming(true)} title="Arrancar página · Remove" aria-label={`Eliminar ${entry.name}`}>
          ✕
        </button>
      </div>

      {confirming && (
        <div className="tear-confirm">
          <p>¿Arrancar esta página del pasaporte?</p>
          <div className="tear-confirm-actions">
            <button className="btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Arrancando…' : 'Sí, arrancar'}
            </button>
            <button className="btn-quiet" onClick={() => setConfirming(false)} disabled={busy}>
              Conservar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── add + filler pages ────────────────────────────────────────────────────────

export function AddPage({ onAdd, isEmpty }) {
  return (
    <div className="page-content add-page">
      <div className="add-frame">
        <span className="add-eyebrow">PRÓXIMA CONQUISTA · next conquest</span>
        <button className="add-seal" onClick={onAdd} aria-label="Registrar nueva salsa">
          <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 5" />
            <line x1="40" y1="26" x2="40" y2="54" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="26" y1="40" x2="54" y2="40" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="add-title">SELLAR NUEVA SALSA</div>
        <div className="add-sub">Stamp a new sauce</div>
        <p className="add-fineprint">
          {isEmpty
            ? 'Tu pasaporte espera su primer sello. Empieza suave… o no.'
            : 'El comité del fuego aguarda tu próxima hazaña.'}
        </p>
      </div>
    </div>
  );
}

export function BlankPage() {
  return (
    <div className="page-content blank-page">
      <span className="pfield-label">NOTAS <i>Notes</i></span>
      <div className="blank-lines" />
      <FanGauge heat={10} size={190} className="blank-watermark" />
    </div>
  );
}
