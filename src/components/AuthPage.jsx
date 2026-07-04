import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FanGauge from './FanGauge';
import { AzulejoStrip, Divider, FanEmblem } from './Ornaments';
import { HEAT_LEVELS } from '../utils/heat';

// The "oficina de expedición" — where passports are issued. A flamenco
// poster on the left, the paper application form on the right.

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.email, form.password, form.name);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-stage">
        <div className="auth-poster">
          <FanEmblem size={190} className="auth-emblem" />
          <h1 className="auth-title">PASAPORTE<br />PICANTE</h1>
          <div className="auth-subtitle">HOT SAUCE PASSPORT</div>
          <Divider className="auth-divider" />
          <p className="auth-tagline">
            Registra cada salsa que pruebas. Colecciona sellos.
            Camina del fuego suave al infierno.
          </p>
          <p className="auth-tagline-en">
            Record every sauce you try — ranked from mild to inferno.
          </p>
          <div className="auth-legend">
            {HEAT_LEVELS.map((l) => (
              <div key={l.key} className="auth-legend-item">
                <FanGauge heat={l.max} size={46} showGuards={false} />
                <span>{l.es}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <AzulejoStrip height={12} />
          <div className="auth-card-body">
            <div className="auth-office">OFICINA DE EXPEDICIÓN · passport office</div>

            <div className="auth-tabs" role="tablist">
              <button
                role="tab"
                aria-selected={mode === 'login'}
                className={`auth-tab ${mode === 'login' ? 'auth-tab-active' : ''}`}
                onClick={() => switchMode('login')}
              >
                ENTRAR
              </button>
              <button
                role="tab"
                aria-selected={mode === 'register'}
                className={`auth-tab ${mode === 'register' ? 'auth-tab-active' : ''}`}
                onClick={() => switchMode('register')}
              >
                CREAR CUENTA
              </button>
            </div>

            {error && <div className="form-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <label className="ffield">
                  <span className="ffield-label">NOMBRE <i>Name</i></span>
                  <input value={form.name} onChange={set('name')} maxLength={100} required autoFocus placeholder="Carmen la Valiente" />
                </label>
              )}
              <label className="ffield">
                <span className="ffield-label">CORREO <i>Email</i></span>
                <input type="email" value={form.email} onChange={set('email')} required autoFocus={mode === 'login'} placeholder="carmen@sevilla.es" />
              </label>
              <label className="ffield">
                <span className="ffield-label">CONTRASEÑA <i>Password</i></span>
                <input type="password" value={form.password} onChange={set('password')} required placeholder="••••••••" />
                {mode === 'register' && (
                  <span className="ffield-hint">Mínimo 8 caracteres, con letra y número.</span>
                )}
              </label>

              <button type="submit" className="btn-gold auth-submit" disabled={busy}>
                {busy ? 'UN MOMENTO…' : mode === 'login' ? 'ABRIR MI PASAPORTE' : 'EXPEDIR PASAPORTE'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="auth-foot">REINO DEL PICANTE · de suave a infierno</footer>
    </div>
  );
}
