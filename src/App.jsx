import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EntriesProvider } from './contexts/EntriesContext';
import AuthPage from './components/AuthPage';
import PassportBook from './components/PassportBook';
import FanGauge from './components/FanGauge';
import { ChiliIcon } from './components/Ornaments';

function Nav() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    await logout();
    setBusy(false);
  };

  return (
    <nav className="nav">
      <div className="nav-brand">
        <ChiliIcon size={22} color="#e9c877" stem="#9db36a" />
        <span className="nav-brand-text">PASAPORTE PICANTE</span>
      </div>
      <div className="nav-user">
        <span className="nav-name">{user?.name}</span>
        <button className="nav-logout" onClick={handleLogout} disabled={busy}>
          {busy ? '…' : 'Salir'}
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="splash">
        <FanGauge heat={10} size={150} className="splash-fan" />
        <div className="splash-text">Abriendo el pasaporte…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <EntriesProvider>
      <div className="app-shell">
        <Nav />
        <main className="app-main">
          <PassportBook />
        </main>
        <footer className="app-footer">
          PASAPORTE PICANTE · LA MAS BRAVA · hecho con duende
        </footer>
      </div>
    </EntriesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
