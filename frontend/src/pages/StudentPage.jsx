import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000';

const StudentPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchMyAttendance = async () => {
      const response = await fetch(`${API_URL}/attendance?studentId=${user.id}`);
      const data = await response.json();
      setRecords(data);
    };

    if (user?.id) {
      fetchMyAttendance();
    }
  }, [user]);

  return (
    <div className="card">
      <h2>My Attendance</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{record.date}</td>
              <td>{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentPage;
