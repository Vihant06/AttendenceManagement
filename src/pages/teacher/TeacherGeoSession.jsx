import { useState, useEffect, useRef } from 'react';
import { useApp, isGeoSessionActive } from '../../context/AppContext';
import { startGeoSession, stopGeoSession } from '../../services/firestoreService';
import GeoRadarAnimation from '../../components/GeoRadarAnimation';

const RADIUS_OPTIONS = [50, 100, 150, 200, 500];
const DURATION_OPTIONS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
];

function Countdown({ expiresAt }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function update() {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return <span>{remaining}</span>;
}

export default function TeacherGeoSession() {
  const { state, dispatch } = useApp();

  const [selectedClass, setSelectedClass] = useState(state.classes[0]?.id || '');
  const [radius, setRadius]               = useState(100);
  const [duration, setDuration]           = useState(60);
  const [locStatus, setLocStatus]         = useState('idle'); // idle | fetching | ready | error
  const [teacherCoords, setTeacherCoords] = useState(null);
  const [geoError, setGeoError]           = useState('');

  const cls = state.classes.find(c => c.id === selectedClass);
  const session = state.geoSessions?.[selectedClass];
  const sessionActive = isGeoSessionActive(session);

  function getLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setLocStatus('fetching');
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setTeacherCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('ready');
      },
      err => {
        setGeoError(
          err.code === 1
            ? 'Location permission denied. Please allow location access in your browser settings.'
            : 'Could not get location. Please try again.'
        );
        setLocStatus('error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function openSession() {
    if (!teacherCoords) return;
    const expiresAt = new Date(Date.now() + duration * 60000).toISOString();
    try {
      await startGeoSession(selectedClass, state.auth.userId, teacherCoords.lat, teacherCoords.lng, radius, expiresAt);
    } catch (err) {
      console.error("Failed to start geo session", err);
    }
  }

  async function closeSession() {
    try {
      await stopGeoSession(selectedClass);
      setLocStatus('idle');
      setTeacherCoords(null);
    } catch (err) {
      console.error("Failed to stop geo session", err);
    }
  }

  const checkedInStudents = sessionActive
    ? (session.checkedIn || []).map(id => state.students.find(s => s.id === id)).filter(Boolean)
    : [];

  const notCheckedIn = sessionActive && cls
    ? cls.studentIds
        .filter(id => !(session.checkedIn || []).includes(id))
        .map(id => state.students.find(s => s.id === id))
        .filter(Boolean)
    : [];

  const radarStatus = sessionActive ? 'active' : locStatus === 'fetching' ? 'scanning' : locStatus === 'ready' ? 'inRange' : locStatus === 'error' ? 'outOfRange' : 'idle';

  return (
    <div className="fade-up">
      <div className="label-md">Teacher Portal</div>
      <h1 className="headline-md" style={{ marginTop: '4px' }}>Geo-Fenced Session</h1>
      <p className="body-md mt-2">
        Open a location-locked session. Only students within your geo-fence can mark attendance.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', alignItems: 'start' }}>

        {/* ── Left: Setup / Active panel ─────────────────────────────────── */}
        <div className="flex-col gap-5">

          {!sessionActive ? (
            <>
              {/* Class selector */}
              <div className="card">
                <div className="headline-sm">1. Select Class</div>
                <div style={{ marginTop: '14px' }}>
                  <select className="input" value={selectedClass}
                    onChange={e => { setSelectedClass(e.target.value); setLocStatus('idle'); setTeacherCoords(null); }}>
                    {state.classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                  {cls && (
                    <div className="body-md" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                      {cls.schedule} · {cls.room} · {cls.studentIds.length} students
                    </div>
                  )}
                </div>
              </div>

              {/* Radius */}
              <div className="card">
                <div className="headline-sm">2. Set Geo-Fence Radius</div>
                <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="body-md">Radius</span>
                    <span className="title-md" style={{ color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>
                      {radius} m
                    </span>
                  </div>
                  <input type="range" min="50" max="500" step="50" value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {RADIUS_OPTIONS.map(r => (
                      <button key={r} onClick={() => setRadius(r)}
                        className={radius === r ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
                        {r}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="card">
                <div className="headline-sm">3. Session Duration</div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {DURATION_OPTIONS.map(d => (
                    <button key={d.minutes} onClick={() => setDuration(d.minutes)}
                      className={duration === d.minutes ? 'btn-primary' : 'btn-secondary'}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Get location */}
              <div className="card">
                <div className="headline-sm">4. Capture Your Location</div>
                <p className="body-md mt-2" style={{ fontSize: '0.82rem', marginTop: '8px' }}>
                  This anchors the geo-fence to your current GPS position.
                </p>

                {locStatus === 'idle' && (
                  <button className="btn-primary" onClick={getLocation}
                    style={{ marginTop: '14px' }}>
                    📍 Get My Location
                  </button>
                )}

                {locStatus === 'fetching' && (
                  <div className="flex items-center gap-3" style={{ marginTop: '14px', color: 'var(--on-surface-variant)' }}>
                    <span className="spin-icon" style={{ fontSize: '1.1rem' }}>⟳</span>
                    <span className="body-md">Fetching GPS position…</span>
                  </div>
                )}

                {locStatus === 'ready' && teacherCoords && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--primary-fixed)',
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
                      <span>✅</span>
                      <div>
                        <div className="title-md" style={{ color: 'var(--on-primary-fixed-variant)', fontSize: '0.85rem' }}>Location captured</div>
                        <div className="body-md" style={{ fontSize: '0.75rem' }}>
                          {teacherCoords.lat.toFixed(5)}, {teacherCoords.lng.toFixed(5)}
                        </div>
                      </div>
                      <button className="btn-ghost" onClick={getLocation}
                        style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '4px 10px' }}>
                        Re-capture
                      </button>
                    </div>
                  </div>
                )}

                {locStatus === 'error' && (
                  <div style={{
                    marginTop: '14px', padding: '12px 16px',
                    background: 'var(--error-container)', borderRadius: 'var(--radius-lg)',
                    color: 'var(--on-error-container)', fontSize: '0.82rem', fontWeight: 500,
                  }}>
                    ⚠️ {geoError}
                    <button className="btn-ghost" onClick={getLocation}
                      style={{ display: 'block', marginTop: '8px', fontSize: '0.78rem', color: 'var(--primary)' }}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>

              {/* Open session */}
              <button
                className="btn-primary"
                disabled={locStatus !== 'ready'}
                onClick={openSession}
                style={{
                  justifyContent: 'center', padding: '16px',
                  fontSize: '1rem', opacity: locStatus !== 'ready' ? 0.45 : 1,
                  cursor: locStatus !== 'ready' ? 'not-allowed' : 'pointer',
                }}
              >
                🎯 Open Geo-Fenced Session
              </button>
            </>
          ) : (
            /* ── SESSION ACTIVE STATE ─────────────────────────────────── */
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="headline-sm" style={{ color: 'var(--primary)' }}>Session Active</div>
                  <div className="body-md mt-2">{cls?.name} · {cls?.code}</div>
                </div>
                <div style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-fixed)',
                  color: 'var(--on-primary-fixed-variant)',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: 700, fontSize: '1.1rem',
                }}>
                  <Countdown expiresAt={session.expiresAt} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '18px' }}>
                {[
                  { label: 'Radius', value: `${session.radiusMetres}m` },
                  { label: 'Checked In', value: checkedInStudents.length },
                  { label: 'Pending', value: notCheckedIn.length },
                ].map(s => (
                  <div key={s.label} className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm">{s.value}</div>
                    <div className="label-md">{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className="label-md" style={{ marginBottom: '8px' }}>
                  ✓ Checked In ({checkedInStudents.length})
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '32px' }}>
                  {checkedInStudents.length === 0
                    ? <span className="body-md" style={{ fontSize: '0.8rem' }}>Waiting for students…</span>
                    : checkedInStudents.map(s => (
                      <div key={s.id} style={{
                        padding: '4px 12px', background: 'var(--primary-fixed)',
                        borderRadius: 'var(--radius-full)', fontSize: '0.78rem',
                        color: 'var(--on-primary-fixed-variant)', fontWeight: 500,
                      }}>{s.name.split(' ')[0]}</div>
                    ))
                  }
                </div>
              </div>

              <button
                className="btn-secondary"
                onClick={closeSession}
                style={{ marginTop: '20px', justifyContent: 'center', width: '100%', padding: '12px', color: 'var(--error)', fontWeight: 600 }}
              >
                ✕ Close Session
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Radar visual ────────────────────────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px' }}>
          <GeoRadarAnimation status={radarStatus} size={200} />

          <div style={{ textAlign: 'center' }}>
            <div className="headline-sm">
              {sessionActive ? 'Geo-Fence Active' : locStatus === 'fetching' ? 'Locating…' : locStatus === 'ready' ? 'Location Ready' : locStatus === 'error' ? 'Location Error' : 'Awaiting Setup'}
            </div>
            <div className="body-md mt-2" style={{ maxWidth: '240px', margin: '8px auto 0', lineHeight: 1.6 }}>
              {sessionActive
                ? `Students within ${session.radiusMetres}m of your position can now mark attendance.`
                : locStatus === 'fetching'
                ? 'Accessing your device GPS…'
                : locStatus === 'ready'
                ? `Ready to open a ${radius}m geo-fence for ${DURATION_OPTIONS.find(d => d.minutes === duration)?.label}.`
                : locStatus === 'error'
                ? 'GPS access is required to open a session.'
                : 'Follow the steps on the left to open a geo-fenced session.'}
            </div>
          </div>

          {sessionActive && (
            <div className="card-inset" style={{ width: '100%', textAlign: 'center' }}>
              <div className="label-md">Anchor Point</div>
              <div className="body-md" style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {session.lat.toFixed(5)}, {session.lng.toFixed(5)}
              </div>
              <div className="label-md" style={{ marginTop: '8px' }}>Radius</div>
              <div className="title-md" style={{ color: 'var(--primary)', marginTop: '2px' }}>{session.radiusMetres} metres</div>
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="card mt-8" style={{ background: 'var(--surface-container-low)', boxShadow: 'none', marginTop: '24px' }}>
        <div className="label-md">📡 How Geo-Fencing Works</div>
        <p className="body-md mt-2" style={{ lineHeight: 1.7 }}>
          When you open a session, your GPS coordinates become the <strong>anchor point</strong>. The system stores a radius (metres). When a student clicks "Check In," the browser fetches their real GPS and computes the <a href="https://en.wikipedia.org/wiki/Haversine_formula" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Haversine distance</a> between their position and the anchor. If they're within your radius, attendance is marked automatically.
        </p>
      </div>
    </div>
  );
}
