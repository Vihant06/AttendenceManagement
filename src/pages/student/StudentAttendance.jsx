import { useApp, getStudentAttendanceSummary } from '../../context/AppContext';

function statusBadge(status) {
  if (!status) return <span className="badge" style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' }}>—</span>;
  return <span className={`badge badge-${status}`}><span className={`orb orb-${status}`} />{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function StudentAttendance() {
  const { state } = useApp();
  const student = state.students.find(s => s.id === state.activeStudentId);
  const summary = getStudentAttendanceSummary(state, state.activeStudentId);

  const myClasses = state.classes.filter(cls => (cls.studentIds || []).includes(state.activeStudentId));

  return (
    <div className="fade-up">
      <div className="label-md">Student View</div>
      <h1 className="headline-md" style={{ marginTop: '4px' }}>My Attendance History</h1>
      <p className="body-md mt-2">Detailed session-by-session log for {student?.name}.</p>

      <div className="flex-col gap-8 mt-8">
        {myClasses.map(cls => {
          const records = state.attendanceRecords[cls.id] || {};
          const allDates = Object.keys(records).sort().reverse();
          const s = summary[cls.id] || { percentage: 100, present: 0, absent: 0, late: 0 };

          return (
            <div key={cls.id} className="card">
              {/* Class header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="headline-sm">{cls.name}</div>
                  <div className="body-md mt-2">{cls.code} · {cls.room} · {cls.schedule}</div>
                </div>
                <div className="flex gap-3">
                  <div className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm" style={{ color: 'var(--primary)' }}>{s.percentage}%</div>
                    <div className="label-md">Overall</div>
                  </div>
                  <div className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm">{s.present}</div>
                    <div className="label-md">Present</div>
                  </div>
                  <div className="stat-chip" style={{ textAlign: 'center' }}>
                    <div className="headline-sm">{s.absent}</div>
                    <div className="label-md">Absent</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-track mt-4" style={{ marginTop: '16px' }}>
                <div className="progress-fill" style={{ width: `${s.percentage}%` }} />
              </div>

              {/* Sessions table */}
              {allDates.length > 0 ? (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table className="att-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDates.map(date => {
                        const status = records[date]?.[state.activeStudentId];
                        return (
                          <tr key={date}>
                            <td>
                              <span className="title-md">{new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </td>
                            <td className="body-md">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' })}
                            </td>
                            <td>{statusBadge(status)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="body-md" style={{ marginTop: '16px', textAlign: 'center', padding: '24px' }}>No sessions recorded yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
