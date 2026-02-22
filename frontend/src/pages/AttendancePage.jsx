import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000';

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/students`);
        const data = await response.json();
        setStudents(data);

        const initialStatus = {};
        data.forEach((student) => {
          initialStatus[student._id] = 'present';
        });
        setStatusMap(initialStatus);
      } catch {
        setMessage('Could not load students');
      }
    };

    fetchStudents();
  }, []);

  const changeStatus = (studentId, value) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: value }));
  };

  const saveAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const records = students.map((student) => ({
      studentId: student._id,
      date: today,
      status: statusMap[student._id] || 'absent'
    }));

    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });

      if (!response.ok) {
        setMessage('Failed to save attendance');
        return;
      }

      setMessage('Attendance saved successfully');
    } catch {
      setMessage('Server error while saving attendance');
    }
  };

  return (
    <div className="card">
      <h2>Mark Attendance (Teacher)</h2>
      {students.map((student) => (
        <div key={student._id} className="row">
          <span>{student.name}</span>
          <select
            value={statusMap[student._id] || 'present'}
            onChange={(e) => changeStatus(student._id, e.target.value)}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      ))}
      <button onClick={saveAttendance}>Save Attendance</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AttendancePage;
