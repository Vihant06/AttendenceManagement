import { useApp, getStudentAttendanceSummary } from '../../context/AppContext';

function AttPercentCircle({ pct }) {
  const r = 36, circ = 2 * Math.PI * r;
  const color = pct >= 75 ? 'var(--primary)' : pct >= 50 ? 'var(--tertiary-fixed-dim)' : 'var(--error)';
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--surface-container-high)" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        strokeDashoffset={circ / 4}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="44" y="44" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 700, fill: 'var(--on-surface)' }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function StudentDashboard() {
  const { state, dispatch } = useApp();
  const student = state.students.find(s => s.id === state.activeStudentId);
  const summary = getStudentAttendanceSummary(state, state.activeStudentId);

  const overallPct = (() => {
    let t = 0, p = 0;
    for (const v of Object.values(summary)) { t += v.total; p += v.present + v.late; }
    return t ? Math.round((p / t) * 100) : 100;
  })();

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const otherStudents = state.students.filter(s => s.id !== state.activeStudentId);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center fade-up">
        <div>
          <div className="label-md">{today}</div>
          <h1 className="display-lg" style={{ marginTop: '4px' }}>Hello, {student?.name.split(' ')[0]} 👋</h1>
          <p className="body-md" style={{ marginTop: '6px' }}>Here's your attendance overview.</p>
        </div>
        <div>
          <label className="label-md" htmlFor="student-switcher" style={{ display: 'block', marginBottom: '4px' }}>View as</label>
          <select
            id="student-switcher"
            className="input"
            style={{ width: 'auto' }}
            value={state.activeStudentId}
            onChange={e => dispatch({ type: 'SET_ACTIVE_STUDENT', payload: e.target.value })}
          >
            {state.students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall stats row */}
      <div className="page-grid-4 mt-8 fade-up delay-1">
        {[
          { label: 'Overall Attendance', value: `${overallPct}%`, sub: 'All classes combined' },
          { label: 'Classes Enrolled', value: Object.keys(summary).length, sub: 'Active this semester' },
          { label: 'Total Sessions', value: Object.values(summary).reduce((a, v) => a + v.total, 0), sub: 'Recorded so far' },
          { label: 'Absences', value: Object.values(summary).reduce((a, v) => a + v.absent, 0), sub: 'Across all classes' },
        ].map(stat => (
          <div key={stat.label} className="card stat-chip" style={{ padding: '20px 24px', gap: '6px' }}>
            <div className="label-md">{stat.label}</div>
            <div className="headline-md" style={{ fontSize: '2rem', lineHeight: 1 }}>{stat.value}</div>
            <div className="body-md" style={{ fontSize: '0.75rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Per-class breakdown */}
      <h2 className="headline-sm mt-8 fade-up delay-2">Class Breakdown</h2>
      <div className="flex-col gap-4 mt-4 fade-up delay-3">
        {state.classes.filter(cls => cls.studentIds.includes(state.activeStudentId)).map(cls => {
          const s = summary[cls.id] || { total: 0, present: 0, late: 0, absent: 0, percentage: 100 };
          return (
            <div key={cls.id} className="card flex items-center gap-6" style={{ padding: '20px 24px' }}>
              <AttPercentCircle pct={s.percentage} />
              <div style={{ flex: 1 }}>
                <div className="title-md">{cls.name}</div>
                <div className="body-md">{cls.code} · {cls.schedule}</div>
                <div className="progress-track mt-2" style={{ width: '100%', marginTop: '12px' }}>
                  <div className="progress-fill" style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Present', val: s.present },
                  { label: 'Late', val: s.late },
                  { label: 'Absent', val: s.absent },
                ].map(item => (
                  <div key={item.label} className="stat-chip" style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div className="headline-sm">{item.val}</div>
                    <div className="label-md">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
