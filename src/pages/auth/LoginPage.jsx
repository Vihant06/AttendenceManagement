import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { loginUser, signupUser } from '../../services/authService';

const ROLE_META = {
  teacher: {
    label: 'Teacher Portal',
    icon: '🎓',
    color: 'var(--primary)',
    bg: 'linear-gradient(135deg, var(--primary-fixed), var(--primary-fixed-dim))',
  },
  student: {
    label: 'Student Portal',
    icon: '📚',
    color: 'var(--secondary)',
    bg: 'linear-gradient(135deg, var(--secondary-fixed), var(--secondary-fixed-dim))',
  },
};

export default function LoginPage() {
  const { role } = useParams(); // 'teacher' | 'student'
  const { state } = useApp();
  const navigate = useNavigate();
  const meta = ROLE_META[role] || ROLE_META.student;

  const [isSignup, setIsSignup] = useState(false);
  
  // Form state
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo]     = useState('');
  const [department, setDept]   = useState('');
  
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // If already logged in as this role, jump to dashboard
  if (state.auth.isLoggedIn && state.auth.role === role) {
    navigate(`/${role}`, { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signupUser({
          email: email.trim(),
          password,
          role,
          name,
          rollNo: role === 'student' ? rollNo : undefined,
          department: role === 'teacher' ? department : undefined
        });
      } else {
        await loginUser(email.trim(), password);
      }
      
      // Context listener handles dispatching and redirects
      navigate(`/${role}`, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--on-surface-variant)', fontSize: '0.85rem', marginBottom: '32px',
          textDecoration: 'none', transition: 'color 0.2s',
        }}>
          ← Back to portal selection
        </Link>

        <div className="card fade-up" style={{ padding: '40px' }}>
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
              <div className="label-md" style={{ marginBottom: '2px' }}>{isSignup ? 'Create account for' : 'Sign in to'}</div>
              <div className="headline-sm">{meta.label}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {isSignup && (
              <div>
                <div className="label-md" style={{ marginBottom: '8px' }}>Full Name</div>
                <input
                  className="input" type="text" required
                  placeholder="e.g. Arjun Mehta"
                  value={name} onChange={e => { setName(e.target.value); setError(''); }}
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            )}

            {isSignup && role === 'student' && (
              <div>
                <div className="label-md" style={{ marginBottom: '8px' }}>Roll Number</div>
                <input
                  className="input" type="text" required
                  placeholder="e.g. CS2021-01"
                  value={rollNo} onChange={e => { setRollNo(e.target.value); setError(''); }}
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            )}

            {isSignup && role === 'teacher' && (
              <div>
                <div className="label-md" style={{ marginBottom: '8px' }}>Department</div>
                <input
                  className="input" type="text" required
                  placeholder="e.g. Computer Science"
                  value={department} onChange={e => { setDept(e.target.value); setError(''); }}
                  style={{ fontSize: '0.95rem' }}
                />
              </div>
            )}

            <div>
              <div className="label-md" style={{ marginBottom: '8px' }}>Email Address</div>
              <input
                className="input" type="email" required
                placeholder="your@email.edu"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                style={{ fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <div className="label-md" style={{ marginBottom: '8px' }}>Password</div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input" type={showPwd ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  style={{ fontSize: '0.95rem', paddingRight: '48px' }}
                />
                <button
                  type="button" onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--outline)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                  }}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', background: 'var(--error-container)', borderRadius: 'var(--radius-lg)',
                color: 'var(--on-error-container)', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>⚠️</span>{error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{
              justifyContent: 'center', fontSize: '0.95rem', padding: '14px 24px', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="spin-icon">⟳</span> Processing…</span>
              ) : (
                isSignup ? 'Create Account →' : `Sign in to ${meta.label} →`
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              style={{ fontSize: '0.85rem' }}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
