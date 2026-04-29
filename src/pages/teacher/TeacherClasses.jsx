import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { createClass } from '../../services/firestoreService';

export default function TeacherClasses() {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', schedule: '', room: '', semester: 'Spring 2025' });

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await createClass({
        name: form.name,
        code: form.code,
        schedule: form.schedule,
        room: form.room,
        semester: form.semester,
        studentIds: [],
        teacherId: state.auth.userId // Ensure we link it to the teacher!
      });
      setForm({ name: '', code: '', schedule: '', room: '', semester: 'Spring 2025' });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create class", err);
    }
  }

  return (
    <div className="fade-up">
      <div className="flex justify-between items-center">
        <div>
          <div className="label-md">Teacher Portal</div>
          <h1 className="headline-md" style={{ marginTop: '4px' }}>My Classes</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ New Class'}
        </button>
      </div>

      {/* Create class form */}
      {showForm && (
        <div className="card mt-6" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="headline-sm">Create New Class</div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div>
              <div className="label-md" style={{ marginBottom: '6px' }}>Class Name</div>
              <input className="input" required placeholder="e.g. Introduction to ML"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <div className="label-md" style={{ marginBottom: '6px' }}>Course Code</div>
              <input className="input" required placeholder="e.g. CS401"
                value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
            </div>
            <div>
              <div className="label-md" style={{ marginBottom: '6px' }}>Schedule</div>
              <input className="input" required placeholder="e.g. Mon / Wed — 10:00 AM"
                value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} />
            </div>
            <div>
              <div className="label-md" style={{ marginBottom: '6px' }}>Room</div>
              <input className="input" required placeholder="e.g. Lab 3B"
                value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Class</button>
            </div>
          </form>
        </div>
      )}

      {/* Classes list */}
      <div className="flex-col gap-4 mt-6">
        {state.classes.map(cls => (
          <div key={cls.id} className="card" style={{ padding: '24px 28px' }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="headline-sm">{cls.name}</div>
                <div className="body-md mt-2">{cls.code} · {cls.semester}</div>
              </div>
              <div className="flex gap-3">
                <div className="stat-chip" style={{ textAlign: 'center' }}>
                  <div className="headline-sm">{cls.studentIds.length}</div>
                  <div className="label-md">Students</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4" style={{ marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { icon: '🕐', text: cls.schedule },
                { icon: '📍', text: cls.room },
              ].map(item => (
                <div key={item.text} className="card-inset flex items-center gap-2" style={{ padding: '8px 14px' }}>
                  <span>{item.icon}</span>
                  <span className="body-md" style={{ fontSize: '0.8rem' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {cls.studentIds.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div className="label-md" style={{ marginBottom: '8px' }}>Enrolled Students</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {state.students.filter(s => cls.studentIds.includes(s.id)).map(s => (
                    <div key={s.id} className="flex items-center gap-2" style={{
                      background: 'var(--surface-container)', borderRadius: 'var(--radius-full)',
                      padding: '4px 12px 4px 4px', fontSize: '0.8rem', color: 'var(--on-surface)',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
                        color: 'white', fontSize: '0.6rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {s.name.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
