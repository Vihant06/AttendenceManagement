import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp, validateLogin } from '../../context/AppContext';

const ROLE_META = {
  teacher: {
    label: 'Teacher Portal',
    icon: '🎓',
    color: 'var(--primary)',
    bg: 'linear-gradient(135deg, var(--primary-fixed), var(--primary-fixed-dim))',
    hint: { email: 'priya.sharma@eduatelier.in', password: 'teacher123' },
  },
  student: {
    label: 'Student Portal',
    icon: '📚',
    color: 'var(--secondary)',
    bg: 'linear-gradient(135deg, var(--secondary-fixed), var(--secondary-fixed-dim))',
    hint: { email: 'arjun@student.edu', password: 'student123' },
  },
};

export default function LoginPage() {
  const { role } = useParams(); // 'teacher' | 'student'
  const { dispatch, state } = useApp();
  const navigate = useNavigate();
  const meta = ROLE_META[role] || ROLE_META.student;

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // If already logged in as this role, jump to dashboard
  if (state.auth.isLoggedIn && state.auth.role === role) {
    navigate(`/${role}`, { replace: true });
  }

  function handleHint() {
    setEmail(meta.hint.email);
    setPassword(meta.hint.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network latency (backend-compatible pattern)
    await new Promise(res => setTimeout(res, 700));

    const user = validateLogin(role, email.trim(), password);
    if (!user) {
      setError('Invalid email or password. Try the demo credentials below.');
      setLoading(false);
      return;
    }

    dispatch({ type: 'LOGIN', payload: { role, userId: user.id } });

    // Also set active student if logging in as student
    if (role === 'student') {
      dispatch({ type: 'SET_ACTIVE_STUDENT', payload: user.id });
    }

    navigate(`/${role}`, { replace: true });
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background accent blob */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: '600px', height: '600px', borderRadius: '50%',
        background: meta.bg, opacity: 0.25, filter: 'blur(80px)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Back link */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginBottom: '32px',
          textDecoration: 'none', transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--on-surface)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}
        >
          ← Back to portal selection
        </Link>

        {/* Card */}
        <div className="card fade-up" style={{ padding: '40px' }}>

          {/* Role badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '14px',
              background: meta.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
            }}>
              {meta.icon}
            </div>
            <div>
              <div className="label-md" style={{ marginBottom: '2px' }}>Sign in to</div>
              <div className="headline-sm">{meta.label}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div>
              <div className="label-md" style={{ marginBottom: '8px' }}>Email Address</div>
              <input
                className="input"
                type="email"
                required
                autoComplete="email"
                placeholder="your@email.edu"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="label-md" style={{ marginBottom: '8px' }}>Password</div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ fontSize: '0.95rem', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--outline)', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '1rem',
                  }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'var(--error-container)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--on-error-container)',
                fontSize: '0.8rem',
                fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠️</span>{error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                justifyContent: 'center',
                fontSize: '0.95rem',
                padding: '14px 24px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spin-icon">⟳</span> Signing in…
                </span>
              ) : (
                `Sign in to ${meta.label} →`
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: '24px',
            padding: '14px 16px',
            background: 'var(--surface-container-low)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div className="label-md" style={{ marginBottom: '6px' }}>💡 Demo Credentials</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
              <strong>Email:</strong> {meta.hint.email}<br />
              <strong>Password:</strong> {meta.hint.password}
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleHint}
              style={{ marginTop: '8px', fontSize: '0.78rem', padding: '6px 14px' }}
            >
              ↑ Fill automatically
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
