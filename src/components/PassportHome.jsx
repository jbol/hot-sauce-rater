import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSauces } from '../contexts/SaucesContext';
import { hotSauces } from '../data/hotSauces';
import PassportStamp from './PassportStamp';

function formatIssueDate(iso) {
  if (!iso) return '—';
  return new Date(iso)
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
}

export default function PassportHome() {
  const { user } = useAuth();
  const { ratings, favorites, loading } = useSauces();

  const { ratedSauces, unratedSauces } = useMemo(() => {
    const rated = hotSauces.filter((s) => ratings[s.id]);
    const unrated = hotSauces.filter((s) => !ratings[s.id]);
    return { ratedSauces: rated, unratedSauces: unrated };
  }, [ratings]);

  const passportNo = `HSP${String(user?.id || 0).padStart(6, '0')}`;
  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const progressPct = hotSauces.length
    ? Math.round((ratedSauces.length / hotSauces.length) * 100)
    : 0;

  return (
    <div className="passport-page-wrap">

      {/* ── Passport Cover ─────────────────────────────────── */}
      <div className="passport-cover">
        <div className="passport-cover-inner">
          <div className="cover-top-text">REPUBLIC OF SPICE</div>
          <div className="cover-emblem">🔥</div>
          <div className="cover-title">HOT SAUCE</div>
          <div className="cover-title cover-title-sub">PASSPORT</div>
          <div className="cover-divider" />
          <div className="cover-holder">{(user?.name || '').toUpperCase()}</div>
        </div>
      </div>

      {/* ── Open Passport ──────────────────────────────────── */}
      <div className="passport-book">

        {/* Left page — bio data */}
        <div className="passport-leaf passport-bio">
          <div className="leaf-security-bg" />
          <div className="leaf-content">
            <div className="bio-header">
              <div className="bio-header-text">
                <div className="bio-header-primary">HOT SAUCE PASSPORT</div>
                <div className="bio-header-secondary">PASSEPORT SAUCE PIQUANTE</div>
              </div>
            </div>

            <div className="bio-photo-row">
              <div className="bio-photo">
                <span className="bio-initials">{initials}</span>
              </div>
            </div>

            <div className="bio-fields">
              {[
                ['SURNAME / NOM', (user?.name || '').split(' ').slice(-1)[0]?.toUpperCase() || '—'],
                ['GIVEN NAMES / PRÉNOMS', (user?.name || '').split(' ').slice(0, -1).join(' ').toUpperCase() || '—'],
                ['PASSPORT NO.', passportNo],
                ['DATE OF ISSUE', formatIssueDate(user?.created_at)],
                ['AUTHORITY', 'SPICE IMMIGRATION BUREAU'],
                ['EMAIL', user?.email || '—'],
              ].map(([label, val]) => (
                <div className="bio-row" key={label}>
                  <span className="bio-label">{label}</span>
                  <span className="bio-val">{val}</span>
                </div>
              ))}

              <div className="bio-row bio-row-highlight">
                <span className="bio-label">SAUCES TASTED</span>
                <span className="bio-val bio-val-big">
                  {ratedSauces.length} <span className="bio-of">/ {hotSauces.length}</span>
                </span>
              </div>
            </div>

            {/* Machine Readable Zone */}
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

        {/* Right page — stamps */}
        <div className="passport-leaf passport-stamps">
          <div className="leaf-security-bg" />
          <div className="leaf-content">
            <div className="stamps-page-title">
              ENTRY STAMPS &nbsp;/&nbsp; TAMPONS D&apos;ENTRÉE
            </div>

            {loading ? (
              <div className="stamps-loading">
                <span className="stamps-loading-icon">🌶️</span>
                Loading your tasting record…
              </div>
            ) : (
              <div className="stamps-grid">
                {ratedSauces.map((sauce) => (
                  <PassportStamp
                    key={sauce.id}
                    sauce={sauce}
                    rating={ratings[sauce.id]?.rating}
                    ratedAt={ratings[sauce.id]?.ratedAt}
                    isFavorite={favorites.includes(sauce.id)}
                  />
                ))}
                {unratedSauces.map((sauce) => (
                  <PassportStamp key={sauce.id} sauce={sauce} unrated />
                ))}
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
            <div
              className="progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="progress-caption">
            {ratedSauces.length} of {hotSauces.length} sauces tasted
            {ratedSauces.length === hotSauces.length && (
              <span className="progress-complete"> 🏆 MASTER TASTER!</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
