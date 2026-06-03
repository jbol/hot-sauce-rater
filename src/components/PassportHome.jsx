import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSauces } from '../contexts/SaucesContext';
import { hotSauces } from '../data/hotSauces';
import PassportStamp from './PassportStamp';

const HEAT_LEVELS = {
  1: { label: 'MILD',       color: '#16a34a' },
  2: { label: 'MEDIUM',     color: '#d97706' },
  3: { label: 'HOT',        color: '#ea580c' },
  4: { label: 'EXTRA HOT',  color: '#dc2626' },
  5: { label: 'INFERNO',    color: '#7c3aed' },
};

function formatIssueDate(iso) {
  if (!iso) return '—';
  return new Date(iso)
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function PassportHome() {
  const { user } = useAuth();
  const { ratings, favorites, loading } = useSauces();

  const { groupedRated, unratedSauces, totalRated } = useMemo(() => {
    // Group rated sauces by heatLevel; each group sorted alphabetically
    const grouped = {};
    hotSauces.forEach((s) => {
      if (ratings[s.id]) {
        const lvl = s.heatLevel;
        if (!grouped[lvl]) grouped[lvl] = [];
        grouped[lvl].push(s);
      }
    });
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => a.name.localeCompare(b.name))
    );

    const unrated = hotSauces
      .filter((s) => !ratings[s.id])
      .sort((a, b) => a.heatLevel - b.heatLevel);
    const total = hotSauces.filter((s) => ratings[s.id]).length;
    return { groupedRated: grouped, unratedSauces: unrated, totalRated: total };
  }, [ratings]);

  // Heat levels present in the user's tasting record, sorted 1 → 5
  const heatLevelsPresent = Object.keys(groupedRated)
    .map(Number)
    .sort((a, b) => a - b);

  const passportNo = `HSP${String(user?.id || 0).padStart(6, '0')}`;
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const progressPct = hotSauces.length
    ? Math.round((totalRated / hotSauces.length) * 100)
    : 0;

  return (
    <div className="passport-page-wrap">

      {/* ── Passport Cover ─────────────────────────────────── */}
      <div className="passport-cover-container">
        <div className="passport-cover-spine" />
        <div className="passport-cover">
          <div className="passport-cover-inner">
            <div className="cover-corner cover-corner-tl" />
            <div className="cover-corner cover-corner-tr" />
            <div className="cover-corner cover-corner-bl" />
            <div className="cover-corner cover-corner-br" />

            <div className="cover-top-text">REPUBLIC OF SPICE</div>
            <div className="cover-top-subtext">REPÚBLICA DE LA PIMIENTA</div>

            <div className="cover-seal">
              <div className="cover-seal-outer" />
              <div className="cover-seal-inner" />
              <div className="cover-emblem">🔥</div>
            </div>

            <div className="cover-title-group">
              <div className="cover-title">HOT SAUCE</div>
              <div className="cover-title cover-title-sub">PASSPORT</div>
              <div className="cover-title-footnote">PASSEPORT · PASAPORTE</div>
            </div>

            <div className="cover-divider" />
            <div className="cover-holder">{(user?.name || '').toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* ── Open Passport (two-page spread) ────────────────── */}
      <div className="passport-book">

        {/* Left page — identity / bio data */}
        <div className="passport-leaf passport-bio">
          <div className="leaf-guilloche" />
          <div className="leaf-corner leaf-corner-tl">✦</div>
          <div className="leaf-corner leaf-corner-tr">✦</div>
          <div className="leaf-corner leaf-corner-bl">✦</div>
          <div className="leaf-corner leaf-corner-br">✦</div>

          <div className="leaf-content">
            <div className="bio-header">
              <div className="bio-header-primary">HOT SAUCE PASSPORT</div>
              <div className="bio-header-secondary">
                PASSEPORT SAUCE PIQUANTE · PASAPORTE SALSA PICANTE
              </div>
            </div>

            <div className="bio-photo-row">
              <div className="bio-photo">
                <span className="bio-initials">{initials}</span>
              </div>
              <div className="bio-stats-panel">
                <div className="bio-stat-label">HEAT PROGRESS</div>
                <div className="bio-heat-bar">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      className={`bio-heat-seg ${groupedRated[lvl] ? 'bio-heat-seg-active' : ''}`}
                      style={{ '--seg-color': HEAT_LEVELS[lvl].color }}
                      title={HEAT_LEVELS[lvl].label}
                    />
                  ))}
                </div>
                <div className="bio-stat-label" style={{ marginTop: '0.6rem' }}>
                  SAUCES TASTED
                </div>
                <div className="bio-tasted-count">
                  {totalRated}
                  <span className="bio-of"> / {hotSauces.length}</span>
                </div>
              </div>
            </div>

            <div className="bio-fields">
              {[
                ['SURNAME / NOM',         (user?.name || '').split(' ').slice(-1)[0]?.toUpperCase() || '—'],
                ['GIVEN NAMES / PRÉNOMS',  (user?.name || '').split(' ').slice(0, -1).join(' ').toUpperCase() || '—'],
                ['PASSPORT NO.',           passportNo],
                ['DATE OF ISSUE',          formatIssueDate(user?.created_at)],
                ['AUTHORITY',              'SPICE IMMIGRATION BUREAU'],
                ['TASTER STATUS',          totalRated === hotSauces.length ? 'MASTER TASTER 🏆' : 'ACTIVE TASTER'],
              ].map(([label, val]) => (
                <div className="bio-row" key={label}>
                  <span className="bio-label">{label}</span>
                  <span className="bio-val">{val}</span>
                </div>
              ))}
            </div>

            {/* Machine-Readable Zone */}
            <div className="mrz">
              <div className="mrz-line">
                {`P<ROS${passportNo}<<${(user?.name || '').replace(/\s+/g, '<').toUpperCase()}<<<<`.slice(0, 44)}
              </div>
              <div className="mrz-line">
                {`${passportNo}<ROS${new Date().getFullYear()}0101<<<<<<<<<<<<<`.slice(0, 44)}
              </div>
            </div>
          </div>
          <div className="leaf-page-num">1</div>
        </div>

        {/* Right page — entry stamps sorted least → most spicy */}
        <div className="passport-leaf passport-stamps">
          <div className="leaf-guilloche" />
          <div className="leaf-corner leaf-corner-tl">✦</div>
          <div className="leaf-corner leaf-corner-tr">✦</div>
          <div className="leaf-corner leaf-corner-bl">✦</div>
          <div className="leaf-corner leaf-corner-br">✦</div>

          <div className="leaf-content">
            <div className="stamps-page-title">
              TASTING RECORD &nbsp;/&nbsp; ENTRÉES DE DÉGUSTATION
            </div>

            {loading ? (
              <div className="stamps-loading">
                <span className="stamps-loading-icon">🌶️</span>
                Loading your tasting record…
              </div>
            ) : totalRated === 0 ? (
              <div className="stamps-empty">
                <div className="stamps-empty-icon">🌶️</div>
                <div className="stamps-empty-msg">No entry stamps yet</div>
                <div className="stamps-empty-sub">
                  Visit Explore to start tasting &amp; earn your first stamp!
                </div>
              </div>
            ) : (
              <div className="stamps-sections">
                {/* Rated sauces grouped by heat level, ascending */}
                {heatLevelsPresent.map((level) => (
                  <div key={level} className="stamps-section">
                    <div
                      className="stamps-section-header"
                      style={{ '--section-color': HEAT_LEVELS[level].color }}
                    >
                      <span className="stamps-section-rule" />
                      <span className="stamps-section-label">
                        {HEAT_LEVELS[level].label}
                      </span>
                      <span className="stamps-section-rule" />
                    </div>
                    <div className="stamps-grid">
                      {groupedRated[level].map((sauce) => (
                        <PassportStamp
                          key={sauce.id}
                          sauce={sauce}
                          rating={ratings[sauce.id]?.rating}
                          ratedAt={ratings[sauce.id]?.ratedAt}
                          isFavorite={favorites.includes(sauce.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Untasted sauces — ghosted, sorted by heat */}
                {unratedSauces.length > 0 && (
                  <div className="stamps-section">
                    <div className="stamps-section-header stamps-section-pending">
                      <span className="stamps-section-rule" />
                      <span className="stamps-section-label">UNTASTED</span>
                      <span className="stamps-section-rule" />
                    </div>
                    <div className="stamps-grid">
                      {unratedSauces.map((sauce) => (
                        <PassportStamp key={sauce.id} sauce={sauce} unrated />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="leaf-page-num">2</div>
        </div>
      </div>

      {/* ── Progress Bar ───────────────────────────────────── */}
      {!loading && (
        <div className="passport-progress">
          <div className="progress-label-row">
            <span className="progress-title">TASTING PROGRESS</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="progress-caption">
            {totalRated} of {hotSauces.length} sauces tasted
            {totalRated === hotSauces.length && (
              <span className="progress-complete"> 🏆 MASTER TASTER!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
