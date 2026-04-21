import { useNavigate } from 'react-router-dom';

const ROLES = [
  {
    role: 'teacher',
    title: 'Teacher Portal',
    desc: 'Manage classes, mark attendance, open geo-fenced sessions, and view comprehensive reports.',
    icon: '🎓',
    bg: 'linear-gradient(135deg, var(--primary-fixed), var(--primary-fixed-dim))',
    path: '/login/teacher',
  },
  {
    role: 'student',
    title: 'Student Portal',
    desc: 'Track your attendance, check in via geo-location, and view your detailed history.',
    icon: '📚',
    bg: 'linear-gradient(135deg, var(--secondary-fixed), var(--secondary-fixed-dim))',
    path: '/login/student',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }} className="fade-up">
        <div style={{
          width: 64, height: 64, borderRadius: '20px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 20px',
          boxShadow: 'var(--shadow-float)',
        }}>🍃</div>
        <h1 className="display-lg">Atelier Attendance</h1>
        <p className="body-md" style={{ marginTop: '10px', fontSize: '1rem', maxWidth: '420px', margin: '10px auto 0' }}>
          A premium attendance management system with geo-fencing, for modern educational institutions.
        </p>
      </div>

      {/* Role cards */}
      <div className="flex gap-6" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        {ROLES.map((r, i) => (
          <button
            key={r.role}
            className={`role-card fade-up delay-${i + 1}`}
            onClick={() => navigate(r.path)}
          >
            <div className="role-icon" style={{ background: r.bg }}>
              <span style={{ fontSize: '2rem' }}>{r.icon}</span>
            </div>
            <div>
              <div className="headline-sm">{r.title}</div>
              <p className="body-md" style={{ marginTop: '6px', fontSize: '0.85rem', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
            <div className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In →
            </div>
          </button>
        ))}
      </div>

      <div className="body-md fade-up delay-3" style={{ marginTop: '40px', fontSize: '0.75rem', textAlign: 'center' }}>
        Frontend demo — no backend required · Data persists in your browser · 📍 Geo-fencing uses real GPS
      </div>
    </div>
  );
}
