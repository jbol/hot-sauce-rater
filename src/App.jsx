import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SaucesProvider } from './contexts/SaucesContext';
import AuthPage from './components/AuthPage';
import PassportHome from './components/PassportHome';
import ExploreView from './components/ExploreView';

function Nav({ view, setView }) {
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
        <span className="nav-flame">🔥</span>
        <span className="nav-brand-text">Hot Sauce Passport</span>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${view === 'passport' ? 'nav-tab-active' : ''}`}
          onClick={() => setView('passport')}
        >
          My Passport
        </button>
        <button
          className={`nav-tab ${view === 'explore' ? 'nav-tab-active' : ''}`}
          onClick={() => setView('explore')}
        >
          Explore
        </button>
      </div>

      <div className="nav-user">
        <span className="nav-name">{user?.name}</span>
        <button className="nav-logout" onClick={handleLogout} disabled={busy}>
          {busy ? '…' : 'Sign Out'}
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('passport');

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-flame">🔥</div>
        <div className="splash-text">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <SaucesProvider>
      <div className="app-shell">
        <Nav view={view} setView={setView} />
        <main className="app-main">
          {view === 'passport' ? <PassportHome /> : <ExploreView />}
        </main>
        <footer className="app-footer">
          🔥 Hot Sauce Passport · Republic of Spice
        </footer>
      </div>
    </SaucesProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
