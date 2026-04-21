import { useState } from 'react';
import { useApp, getClassAttendanceSummary } from '../../context/AppContext';

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.pct), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: '80px', alignItems: 'flex-end' }}>
      {data.map(d => (
        <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{d.pct}%</div>
          <div style={{
            width: '100%', height: `${(d.pct / max) * 60}px`,
            background: d.pct >= 75 ? 'linear-gradient(to top, var(--primary), var(--primary-fixed-dim))' : 'var(--error)',
            borderRadius: '4px 4px 0 0', minHeight: '4px',
            transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)'
          }} />
          <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textAlign: 'center', lineHeight: 1.2 }}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TeacherReports() {
  const { state } = useApp();
  const [selectedClass, setSelectedClass] = useState(state.classes[0]?.id || '');

  const cls = state.classes.find(c => c.id === selectedClass);
  const summary = getClassAttendanceSummary(state, selectedClass);

  const chartData = (cls?.studentIds || []).map(sid => {
    const student = state.students.find(s => s.id === sid);
    return { label: student?.name.split(' ')[0] || sid, pct: summary[sid]?.percentage ?? 100 };
  });

  const records = state.attendanceRecords[selectedClass] || {};
  const allDates = Object.keys(records).sort().reverse();

  return (
    <div className="fade-up">
      <div className="label-md">Teacher Portal</div>
      <h1 className="headline-md" style={{ marginTop: '4px' }}>Attendance Reports</h1>

      {/* Class selector */}
      <div className="flex gap-4 items-center mt-6" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 300px' }}>
          <div className="label-md" style={{ marginBottom: '6px' }}>Select Class</div>
          <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
            ))}
          </select>
        </div>
        {cls && (
          <div className="body-md" style={{ marginTop: '22px' }}>
            {cls.schedule} · {cls.room} · {cls.studentIds.length} students
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="card mt-6">
        <div className="headline-sm">Attendance % by Student</div>
        <p className="body-md mt-2">Hover students below 75% — they may need intervention.</p>
        <div style={{ marginTop: '20px' }}>
          <BarChart data={chartData} />
        </div>
      </div>

      {/* Student summary table */}
      <div className="card mt-6" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px' }}>
          <div className="headline-sm">Student Summary</div>
        </div>
        <table className="att-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No.</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Late</th>
              <th>Total</th>
              <th>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {(cls?.studentIds || []).map(sid => {
              const student = state.students.find(s => s.id === sid);
              const s = summary[sid] || { present: 0, absent: 0, late: 0, total: 0, percentage: 100 };
              return (
                <tr key={sid}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                        color: 'white', fontSize: '0.7rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {student?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="title-md">{student?.name}</span>
                    </div>
                  </td>
                  <td className="body-md">{student?.rollNo}</td>
                  <td><span className="badge badge-present">{s.present}</span></td>
                  <td><span className="badge badge-absent">{s.absent}</span></td>
                  <td><span className="badge badge-late">{s.late}</span></td>
                  <td className="body-md">{s.total}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="progress-track" style={{ width: '80px' }}>
                        <div className="progress-fill" style={{
                          width: `${s.percentage}%`,
                          background: s.percentage >= 75
                            ? 'linear-gradient(90deg, var(--primary), var(--primary-fixed-dim))'
                            : 'var(--error)',
                        }} />
                      </div>
                      <span style={{
                        fontWeight: 700, fontSize: '0.85rem',
                        color: s.percentage >= 75 ? 'var(--primary)' : 'var(--error)',
                      }}>{s.percentage}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Date-wise log */}
      {allDates.length > 0 && (
        <div className="card mt-6" style={{ padding: 0, overflow: 'auto' }}>
          <div style={{ padding: '20px 24px 12px' }}>
            <div className="headline-sm">Session Log</div>
            <p className="body-md mt-2">Each session's attendance at a glance.</p>
          </div>
          <table className="att-table" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Date</th>
                {(cls?.studentIds || []).map(sid => {
                  const s = state.students.find(x => x.id === sid);
                  return <th key={sid}>{s?.name.split(' ')[0]}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {allDates.map(date => (
                <tr key={date}>
                  <td className="title-md" style={{ whiteSpace: 'nowrap' }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  {(cls?.studentIds || []).map(sid => {
                    const status = records[date]?.[sid];
                    return (
                      <td key={sid}>
                        {status
                          ? <span className={`badge badge-${status}`}><span className={`orb orb-${status}`} />{status[0].toUpperCase()}</span>
                          : <span style={{ color: 'var(--outline)' }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
