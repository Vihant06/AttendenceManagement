import { useState } from 'react';
import { useApp, haversineDistance, isGeoSessionActive, getTodayAttendanceStatus } from '../../context/AppContext';
import { markAttendance } from '../../services/firestoreService';
import GeoRadarAnimation from '../../components/GeoRadarAnimation';

// Status for each class card
// 'no-session' | 'idle' | 'scanning' | 'inRange' | 'outOfRange' | 'marked'

export default function StudentGeoMark() {
  const { state } = useApp();
  const student = state.students.find(s => s.id === state.activeStudentId);
  const myClasses = state.classes.filter(cls => cls.studentIds.includes(state.activeStudentId));

  // Per-class geo check state
  const [geoStates, setGeoStates] = useState({});

  function setClassGeo(classId, update) {
    setGeoStates(prev => ({
      ...prev,
      [classId]: { ...(prev[classId] || {}), ...update },
    }));
  }

  function checkLocation(classId, session) {
    if (!navigator.geolocation) {
      setClassGeo(classId, { status: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }
    setClassGeo(classId, { status: 'scanning', distance: null, message: '' });

    navigator.geolocation.getCurrentPosition(
      pos => {
        const studentLat = pos.coords.latitude;
        const studentLng = pos.coords.longitude;
        const dist = Math.round(haversineDistance(session.lat, session.lng, studentLat, studentLng));
        const inRange = dist <= session.radiusMetres;
        setClassGeo(classId, {
          status: inRange ? 'inRange' : 'outOfRange',
          distance: dist,
          studentCoords: { lat: studentLat, lng: studentLng },
          message: inRange
            ? `You're ${dist}m from the class anchor. You can mark yourself present.`
            : `You're ${dist}m away — you need to be within ${session.radiusMetres}m.`,
        });
      },
      err => {
        setClassGeo(classId, {
          status: 'error',
          distance: null,
          message: err.code === 1
            ? 'Location access denied. Please allow location in your browser settings and try again.'
            : 'Could not get your location. Please try again.',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function markPresent(classId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      await markAttendance(state.activeStudentId, classId, today, 'present');
      setClassGeo(classId, { status: 'marked' });
    } catch (err) {
      console.error("Failed to mark attendance", err);
      setClassGeo(classId, { status: 'error', message: "Failed to save attendance." });
    }
  }

  return (
    <div className="fade-up">
      <div className="label-md">Student Portal</div>
      <h1 className="headline-md" style={{ marginTop: '4px' }}>Geo Check-In</h1>
      <p className="body-md mt-2">
        Your teacher opens a location-locked session. Once active, check your location to mark attendance.
      </p>

      <div className="flex-col gap-6" style={{ marginTop: '28px' }}>
        {myClasses.map(cls => {
          const session = state.geoSessions?.[cls.id];
          const active = isGeoSessionActive(session);
          const geo = geoStates[cls.id] || {};
          const todayStatus = getTodayAttendanceStatus(state, cls.id, state.activeStudentId);
          const alreadyMarked = geo.status === 'marked' || todayStatus === 'present';

          let radarStatus = 'idle';
          if (!active) radarStatus = 'idle';
          else if (alreadyMarked) radarStatus = 'inRange';
          else if (geo.status === 'scanning') radarStatus = 'scanning';
          else if (geo.status === 'inRange') radarStatus = 'inRange';
          else if (geo.status === 'outOfRange') radarStatus = 'outOfRange';
          else if (geo.status === 'error') radarStatus = 'outOfRange';
          else if (active) radarStatus = 'active';

          return (
            <div key={cls.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="headline-sm">{cls.name}</div>
                  <div className="body-md" style={{ marginTop: '4px' }}>{cls.code} · {cls.schedule} · {cls.room}</div>
                </div>
                {active
                  ? <span className="badge badge-present" style={{ fontSize: '0.72rem', flexShrink: 0 }}>
                      <span className="orb orb-present" style={{ animation: 'geoOrb 1.5s ease-in-out infinite' }} />
                      Session Open
                    </span>
                  : <span className="badge" style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', fontSize: '0.72rem', flexShrink: 0 }}>
                      No Session
                    </span>
                }
              </div>

              {/* ── Dividing line via tonal shift ── */}
              <div style={{ background: 'var(--surface-container)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>

                  {/* Radar */}
                  <GeoRadarAnimation status={radarStatus} size={120} />

                  {/* Right side content */}
                  <div style={{ flex: 1 }}>

                    {/* ── No session ── */}
                    {!active && (
                      <>
                        <div className="title-md" style={{ color: 'var(--on-surface-variant)' }}>Waiting for Teacher</div>
                        <p className="body-md" style={{ marginTop: '6px', lineHeight: 1.6, fontSize: '0.82rem' }}>
                          Your teacher hasn't opened a geo-fenced session for this class yet. Check back soon.
                        </p>
                      </>
                    )}

                    {/* ── Already marked ── */}
                    {active && alreadyMarked && (
                      <div>
                        <div className="title-md" style={{ color: 'var(--primary)' }}>✅ Attendance Marked</div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem' }}>
                          You've been marked present for today's session via geo check-in.
                        </p>
                      </div>
                    )}

                    {/* ── Idle (session open, not yet checked) ── */}
                    {active && !alreadyMarked && !geo.status && (
                      <div>
                        <div className="title-md">Session is Live!</div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.6 }}>
                          Tap below to verify your location. You need to be within{' '}
                          <strong>{session.radiusMetres}m</strong> of the classroom to check in.
                        </p>
                        <button className="btn-primary" onClick={() => checkLocation(cls.id, session)}
                          style={{ marginTop: '14px' }}>
                          📍 Check My Location
                        </button>
                      </div>
                    )}

                    {/* ── Scanning ── */}
                    {active && !alreadyMarked && geo.status === 'scanning' && (
                      <div>
                        <div className="title-md flex items-center gap-2">
                          <span className="spin-icon">⟳</span> Locating you…
                        </div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem' }}>
                          Accessing your device GPS. Please wait.
                        </p>
                      </div>
                    )}

                    {/* ── In range ── */}
                    {active && !alreadyMarked && geo.status === 'inRange' && (
                      <div>
                        <div className="title-md" style={{ color: 'var(--primary)' }}>
                          ✓ You're in Range!
                        </div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem' }}>{geo.message}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
                          <button className="btn-primary" onClick={() => markPresent(cls.id)}>
                            ✓ Mark Me Present
                          </button>
                          <button className="btn-ghost" onClick={() => checkLocation(cls.id, session)}
                            style={{ fontSize: '0.78rem' }}>
                            Re-check
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Out of range ── */}
                    {active && !alreadyMarked && geo.status === 'outOfRange' && (
                      <div>
                        <div className="title-md" style={{ color: 'var(--error)' }}>
                          ✗ Out of Range
                        </div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem' }}>{geo.message}</p>
                        {geo.distance && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            marginTop: '10px', padding: '8px 14px',
                            background: 'var(--error-container)', borderRadius: 'var(--radius-full)',
                          }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--on-error-container)', fontWeight: 600 }}>
                              {geo.distance}m away · need {session.radiusMetres}m or less
                            </span>
                          </div>
                        )}
                        <div style={{ marginTop: '12px' }}>
                          <button className="btn-secondary" onClick={() => checkLocation(cls.id, session)}>
                            📍 Try Again
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Error ── */}
                    {active && !alreadyMarked && geo.status === 'error' && (
                      <div>
                        <div className="title-md" style={{ color: 'var(--error)' }}>Location Error</div>
                        <p className="body-md" style={{ marginTop: '6px', fontSize: '0.82rem' }}>{geo.message}</p>
                        <button className="btn-secondary" onClick={() => checkLocation(cls.id, session)}
                          style={{ marginTop: '12px' }}>
                          Try Again
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="card" style={{ background: 'var(--surface-container-low)', boxShadow: 'none', marginTop: '24px' }}>
        <div className="label-md">📡 Privacy Note</div>
        <p className="body-md mt-2" style={{ lineHeight: 1.7, fontSize: '0.82rem' }}>
          Your exact GPS coordinates are <strong>never stored</strong> — only whether you were within range is recorded. In the real app, the distance computation would happen server-side so your raw coordinates are never transmitted.
        </p>
      </div>
    </div>
  );
}
