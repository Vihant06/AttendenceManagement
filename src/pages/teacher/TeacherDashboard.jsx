import { useApp, getClassAttendanceSummary } from '../../context/AppContext';

export default function TeacherDashboard() {
  const { state } = useApp();
  const teacher = state.teacher;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Aggregate stats
  let totalSessions = 0, totalPresent = 0, totalStudents = 0;
  for (const cls of state.classes) {
    const records = state.attendanceRecords[cls.id] || {};
    const dates = Object.keys(records);
    const sIds = cls.studentIds || [];
    totalSessions += dates.length;
    totalStudents += sIds.length;
    for (const date of dates) {
      for (const sid of sIds) {
        const s = records[date]?.[sid];
        if (s === 'present' || s === 'late') totalPresent++;
      }
    }
  }
  const totalMarked = (() => {
    let t = 0;
    for (const cls of state.classes) {
      const r = state.attendanceRecords[cls.id] || {};
      for (const date of Object.keys(r)) t += Object.keys(r[date]).length;
    }
    return t;
  })();
  const overallRate = totalMarked ? Math.round((totalPresent / totalMarked) * 100) : 0;

  const stats = [
    { label: 'Total Classes', value: state.classes.length, icon: '⊞', sub: 'Active this semester' },
    { label: 'Total Students', value: totalStudents, icon: '◉', sub: 'Across all classes' },
    { label: 'Sessions Taken', value: totalSessions, icon: '✓', sub: 'Recorded attendance' },
    { label: 'Overall Rate', value: `${overallRate}%`, icon: '⊜', sub: 'Present + Late' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="fade-up">
        <div className="label-md">{today}</div>
        <h1 className="display-lg" style={{ marginTop: '4px' }}>
          Welcome, {teacher.name.split(' ').slice(0, 2).join(' ')} 🌿
        </h1>
        <p className="body-md" style={{ marginTop: '6px' }}>{teacher.department} · {teacher.email}</p>
      </div>

      {/* Stats */}
      <div className="page-grid-4 mt-8 fade-up delay-1">
        {stats.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="flex justify-between items-center">
              <div className="label-md">{s.label}</div>
              <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
            </div>
            <div className="headline-md" style={{ fontSize: '2.2rem', lineHeight: 1 }}>{s.value}</div>
            <div className="body-md" style={{ fontSize: '0.75rem' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Classes with at-a-glance attendance */}
      <h2 className="headline-sm mt-8 fade-up delay-2">Classes at a Glance</h2>
      <div className="flex-col gap-4 mt-4 fade-up delay-3">
        {state.classes.map(cls => {
          const sIds = cls.studentIds || [];
          const summary = getClassAttendanceSummary(state, cls.id);
          const totalStuds = sIds.length;
          const avgPct = totalStuds
            ? Math.round(Object.values(summary).reduce((a, v) => a + v.percentage, 0) / totalStuds)
            : 100;
          // Low attendance students (< 75%)
          const lowStudents = state.students
            .filter(s => sIds.includes(s.id) && (summary[s.id]?.percentage ?? 100) < 75);

          return (
            <div key={cls.id} className="card" style={{ padding: '20px 24px' }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="headline-sm">{cls.name}</div>
                  <div className="body-md mt-2">{cls.code} · {cls.schedule} · {cls.room}</div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm" style={{ color: avgPct >= 75 ? 'var(--primary)' : 'var(--error)' }}>
                      {avgPct}%
                    </div>
                    <div className="label-md">Avg. Attendance</div>
                  </div>
                  <div className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm">{totalStuds}</div>
                    <div className="label-md">Students</div>
                  </div>
                </div>
              </div>

              <div className="progress-track mt-4" style={{ marginTop: '16px' }}>
                <div className="progress-fill" style={{ width: `${avgPct}%` }} />
              </div>

              {lowStudents.length > 0 && (
                <div style={{
                  marginTop: '14px', padding: '10px 16px',
                  background: 'var(--error-container)', borderRadius: 'var(--radius-lg)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span>⚠️</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--on-error-container)', fontWeight: 500 }}>
                    {lowStudents.length} student{lowStudents.length > 1 ? 's' : ''} below 75%:{' '}
                    {lowStudents.map(s => s.name.split(' ')[0]).join(', ')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
