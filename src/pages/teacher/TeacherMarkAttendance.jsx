import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { markBulkAttendance } from '../../services/firestoreService';

const STATUS_OPTIONS = ['present', 'absent', 'late'];

function StatusToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {STATUS_OPTIONS.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`badge badge-${s}`}
          style={{
            opacity: value === s ? 1 : 0.35,
            cursor: 'pointer',
            border: value === s ? '2px solid var(--outline-variant)' : '2px solid transparent',
            transition: 'opacity 0.2s, border 0.2s',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
          }}
        >
          <span className={`orb orb-${s}`} />
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function TeacherMarkAttendance() {
  const { state } = useApp();
  const [selectedClass, setSelectedClass] = useState(state.classes[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [draft, setDraft] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const cls = state.classes.find(c => c.id === selectedClass);
  const existingRecords = state.attendanceRecords[selectedClass]?.[date] || {};

  // Merge existing with draft
  const getStatus = (studentId) => draft[studentId] ?? existingRecords[studentId] ?? 'present';

  function setStatus(studentId, status) {
    setDraft(d => ({ ...d, [studentId]: status }));
    setSaved(false);
  }

  function markAll(status) {
    const newDraft = {};
    (cls?.studentIds || []).forEach(id => { newDraft[id] = status; });
    setDraft(newDraft);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const records = {};
    (cls?.studentIds || []).forEach(id => { records[id] = getStatus(id); });
    
    try {
      await markBulkAttendance(selectedClass, date, records);
      setSaved(true);
    } catch (err) {
      console.error("Failed to save attendance", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fade-up">
      <div className="label-md">Teacher Portal</div>
      <h1 className="headline-md" style={{ marginTop: '4px' }}>Mark Attendance</h1>
      <p className="body-md mt-2">Select a class and date, then mark each student's status.</p>

      {/* Filters */}
      <div className="card mt-6" style={{ padding: '20px 24px' }}>
        <div className="flex gap-6 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div className="label-md" style={{ marginBottom: '6px' }}>Class</div>
            <select className="input" value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setDraft({}); setSaved(false); }}>
              {state.classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <div className="label-md" style={{ marginBottom: '6px' }}>Date</div>
            <input className="input" type="date" value={date}
              onChange={e => { setDate(e.target.value); setDraft({}); setSaved(false); }} />
          </div>
          <div className="flex gap-3 items-center" style={{ marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => markAll('present')}>✓ All Present</button>
            <button className="btn-secondary" onClick={() => markAll('absent')}>✗ All Absent</button>
          </div>
        </div>
      </div>

      {/* Student rows */}
      <div className="card mt-5" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="att-table" style={{ borderRadius: 0 }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(cls?.studentIds || []).map((sid, idx) => {
              const student = state.students.find(s => s.id === sid);
              const status = getStatus(sid);
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
                  <td><StatusToggle value={status} onChange={s => setStatus(sid, s)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="flex justify-between items-center mt-6" style={{ marginTop: '24px' }}>
        {saved && (
          <div className="flex items-center gap-2" style={{ color: 'var(--tertiary)' }}>
            <span>✅</span>
            <span className="title-md">Attendance saved successfully!</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn-primary" onClick={handleSave}>
            💾 Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
