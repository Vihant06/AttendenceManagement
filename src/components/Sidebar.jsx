import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { logoutUser } from '../services/authService';

const TEACHER_LINKS = [
  { to: '/teacher',              label: 'Dashboard',      icon: '◈', end: true },
  { to: '/teacher/classes',      label: 'My Classes',     icon: '⊞' },
  { to: '/teacher/mark',         label: 'Mark Attendance', icon: '✓' },
  { to: '/teacher/geo',          label: 'Live Attendance', icon: '📍' },
  { to: '/teacher/reports',      label: 'Reports',        icon: '⊜' },
];

const STUDENT_LINKS = [
  { to: '/student',              label: 'Dashboard',      icon: '◈', end: true },
  { to: '/student/attendance',   label: 'My Attendance',  icon: '⊜' },
  { to: '/student/geo',          label: 'Live Attendance', icon: '📍' },
  { to: '/student/mark',         label: 'Manual Mark',    icon: '✓' },
];

export default function Sidebar({ role }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const links = role === 'teacher' ? TEACHER_LINKS : STUDENT_LINKS;

  const user = role === 'teacher'
    ? state.teacher
    : state.students.find(s => s.id === state.activeStudentId);

  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  async function handleLogout() {
    try {
      await logoutUser();
      // AppContext listener will handle the dispatch
      navigate('/', { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="nav-logo">
        <div className="nav-logo-icon">🍃</div>
        <div>
          <div className="headline-sm" style={{ fontSize: '1rem', lineHeight: 1.2 }}>Geo Attend</div>
        </div>
      </div>

      {/* Portal label */}
      <div className="label-md" style={{ padding: '16px 12px 6px' }}>
        {role === 'teacher' ? 'Teacher Portal' : 'Student Portal'}
      </div>

      {/* Nav links */}
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      {/* Bottom: user profile + logout */}
      <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="card-inset flex items-center gap-3" style={{ borderRadius: '16px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="title-md" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div className="body-md" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role === 'teacher' ? 'Teacher' : user?.rollNo}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', padding: '10px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--on-surface-variant)', fontSize: '0.8rem', fontWeight: 500,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-container)'; e.currentTarget.style.color = 'var(--on-error-container)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}
        >
          <span>⎋</span> Sign Out
        </button>
      </div>
    </nav>
  );
}
