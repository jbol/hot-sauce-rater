import { useEffect, useState } from 'react';
import FanGauge from './FanGauge';
import StarRating from './StarRating';
import { AzulejoStrip } from './Ornaments';
import { heatCategory, heatFromScoville, todayIso } from '../utils/heat';
import { searchCatalogue } from '../data/catalogue';

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

  // Quick-add combobox over the built-in catalogue (50+ known sauces).
  const [suggestions, setSuggestions] = useState([]);
  const [comboOpen, setComboOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onNameChange = (e) => {
    const value = e.target.value;
    set('name', value);
    const results = searchCatalogue(value);
    setSuggestions(results);
    setComboOpen(results.length > 0);
    setHighlighted(-1);
  };

  // Prefills every catalogue field; the level comes from its Scoville.
  const pickSauce = (sauce) => {
    setForm((f) => ({
      ...f,
      name: sauce.name,
      brand: sauce.brand,
      origin: sauce.origin,
      peppers: sauce.peppers,
      heat: heatFromScoville(sauce.scoville),
      scoville: sauce.scoville,
    }));
    setComboOpen(false);
    setSuggestions([]);
    setHighlighted(-1);
  };

  // While a Scoville is entered, the level is derived from it and the fan is
  // read-only; clear the field to rank by feel again.
  const scovilleNum =
    form.scoville === '' || form.scoville === null ? null : Number(form.scoville);
  const scovilleLock = Number.isInteger(scovilleNum) && scovilleNum >= 0;

  const onScovilleChange = (e) => {
    const value = e.target.value;
    setForm((f) => {
      const n = value === '' ? null : Number(value);
      const locked = Number.isInteger(n) && n >= 0;
      return { ...f, scoville: value, heat: locked ? heatFromScoville(n) : f.heat };
    });
  };

  const onNameKeyDown = (e) => {
    if (!comboOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      pickSauce(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      e.stopPropagation(); // close only the dropdown, not the whole modal
      setComboOpen(false);
    }
  };

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
            <div className="ffield">
              <span className="ffield-label">NOMBRE DE LA SALSA <i>Sauce name *</i></span>
              <div className="combo">
                <input
                  value={form.name}
                  onChange={onNameChange}
                  onKeyDown={onNameKeyDown}
                  onBlur={() => setComboOpen(false)}
                  maxLength={120}
                  autoFocus
                  placeholder="Busca 50+ salsas o escribe la tuya…"
                  role="combobox"
                  aria-expanded={comboOpen}
                  aria-autocomplete="list"
                />
                {comboOpen && (
                  <ul className="combo-list" role="listbox" aria-label="Salsas del catálogo">
                    {suggestions.map((sauce, i) => (
                      <li
                        key={sauce.name}
                        role="option"
                        aria-selected={i === highlighted}
                        className={`combo-item ${i === highlighted ? 'combo-item-active' : ''}`}
                        onMouseDown={(e) => { e.preventDefault(); pickSauce(sauce); }}
                        onMouseEnter={() => setHighlighted(i)}
                      >
                        <span className="combo-name">{sauce.name}</span>
                        <span className="combo-meta">{sauce.brand} · {sauce.origin}</span>
                        <span className="combo-heat">{heatFromScoville(sauce.scoville)}/10</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
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
                onSelect={scovilleLock ? undefined : (h) => set('heat', h)}
                onPreview={scovilleLock ? undefined : setPreview}
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
                  disabled={scovilleLock}
                  className={`fire-tick ${form.heat >= n ? 'fire-tick-on' : ''}`}
                  onClick={() => set('heat', n)}
                  onMouseEnter={scovilleLock ? undefined : () => setPreview(n)}
                  onMouseLeave={scovilleLock ? undefined : () => setPreview(null)}
                >
                  {n}
                </button>
              ))}
            </div>
            {scovilleLock && (
              <p className="fire-locked-note">
                Nivel fijado por el Scoville <i>· level set by the Scoville rating</i>
              </p>
            )}
          </div>

          <div className="form-grid form-grid-3">
            <Field label="PUNTUACIÓN" sub="Rating">
              <StarRating value={form.rating ?? 0} onChange={(r) => set('rating', r)} size={22} />
            </Field>
            <Field label="SCOVILLE" sub="SHU — fija el nivel">
              <input
                type="number"
                min="0"
                step="1"
                value={form.scoville}
                onChange={onScovilleChange}
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
