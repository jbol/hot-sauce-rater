import { useEffect, useState } from 'react';
import FanGauge from './FanGauge';
import StarRating from './StarRating';
import { AzulejoStrip } from './Ornaments';
import { heatCategory, todayIso } from '../utils/heat';

// "Formulario de registro" — the modal used both to stamp a new sauce and to
// amend an existing page. Heat is picked on the fan itself (or the 1–10 ticks).

function Field({ label, sub, children }) {
  return (
    <label className="ffield">
      <span className="ffield-label">
        {label} {sub && <i>{sub}</i>}
      </span>
      {children}
    </label>
  );
}

export default function EntryForm({ initial, onSave, onClose }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    brand: initial?.brand ?? '',
    origin: initial?.origin ?? '',
    peppers: initial?.peppers ?? '',
    heat: initial?.heat ?? 0,
    rating: initial?.rating ?? null,
    scoville: initial?.scoville ?? '',
    notes: initial?.notes ?? '',
    triedOn: initial?.triedOn ?? todayIso(),
  }));
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shownHeat = preview ?? form.heat;
  const cat = shownHeat ? heatCategory(shownHeat) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('La salsa necesita un nombre. · The sauce needs a name.');
    if (!form.heat) return setError('Abre el abanico: elige el fuego del 1 al 10. · Pick a heat from 1 to 10.');

    const scoville = form.scoville === '' || form.scoville === null ? null : Number(form.scoville);
    if (scoville !== null && (!Number.isInteger(scoville) || scoville < 0)) {
      return setError('Scoville debe ser un número entero positivo.');
    }

    setBusy(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        brand: form.brand.trim(),
        origin: form.origin.trim(),
        peppers: form.peppers.trim(),
        heat: form.heat,
        rating: form.rating,
        scoville,
        notes: form.notes.trim(),
        triedOn: form.triedOn || todayIso(),
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={editing ? 'Enmendar registro' : 'Registro de salsa'}>
        <AzulejoStrip height={12} />
        <header className="modal-header">
          <div>
            <h2 className="modal-title">{editing ? 'ENMENDAR REGISTRO' : 'REGISTRO DE SALSA'}</h2>
            <p className="modal-sub">{editing ? 'Amend this passport page' : 'Sauce registration form'}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-grid">
            <Field label="NOMBRE DE LA SALSA" sub="Sauce name *">
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                maxLength={120}
                autoFocus
                placeholder="Salsa Brava"
              />
            </Field>
            <Field label="MARCA" sub="Brand">
              <input value={form.brand} onChange={(e) => set('brand', e.target.value)} maxLength={120} placeholder="La Casa del Fuego" />
            </Field>
            <Field label="ORIGEN" sub="Origin">
              <input value={form.origin} onChange={(e) => set('origin', e.target.value)} maxLength={120} placeholder="Sevilla, España" />
            </Field>
            <Field label="CHILES" sub="Peppers">
              <input value={form.peppers} onChange={(e) => set('peppers', e.target.value)} maxLength={120} placeholder="Habanero, Chipotle" />
            </Field>
          </div>

          <div className="form-fire">
            <span className="ffield-label">ESCALA DE FUEGO <i>Fire scale *</i></span>
            <div className="fire-picker">
              <FanGauge
                heat={shownHeat}
                size={216}
                onSelect={(h) => set('heat', h)}
                onPreview={setPreview}
                ariaLabel="Selector de fuego"
              />
              <div className="fire-readout">
                <span className="fire-readout-num">{shownHeat || '–'}</span>
                <span className="fire-readout-den">/10</span>
                {cat && <span className={`heat-chip heat-${cat.key}`}>{cat.es}</span>}
              </div>
            </div>
            <div className="fire-ticks" role="radiogroup" aria-label="Fuego del 1 al 10">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.heat === n}
                  className={`fire-tick ${form.heat >= n ? 'fire-tick-on' : ''}`}
                  onClick={() => set('heat', n)}
                  onMouseEnter={() => setPreview(n)}
                  onMouseLeave={() => setPreview(null)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <Field label="PUNTUACIÓN" sub="Rating">
              <StarRating value={form.rating ?? 0} onChange={(r) => set('rating', r)} size={22} />
            </Field>
            <Field label="SCOVILLE" sub="SHU, optional">
              <input
                type="number"
                min="0"
                step="1"
                value={form.scoville}
                onChange={(e) => set('scoville', e.target.value)}
                placeholder="5 000"
              />
            </Field>
            <Field label="FECHA" sub="Date tried">
              <input type="date" value={form.triedOn} max={todayIso()} onChange={(e) => set('triedOn', e.target.value)} />
            </Field>
          </div>

          <Field label="NOTAS" sub="Tasting notes">
            <textarea
              rows={3}
              maxLength={2000}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Humo, ajo, y un duende que muerde…"
            />
          </Field>

          <footer className="modal-footer">
            <button type="button" className="btn-quiet" onClick={onClose} disabled={busy}>
              Cancelar
            </button>
            <button type="submit" className="btn-gold" disabled={busy}>
              {busy ? 'SELLANDO…' : editing ? 'GUARDAR CAMBIOS' : 'SELLAR EN EL PASAPORTE'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
