import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000';

const ReportsPage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const response = await fetch(`${API_URL}/attendance`);
      const data = await response.json();
      setRecords(data);
    };

    fetchRecords();
  }, []);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;

    records.forEach((item) => {
      if (item.status === 'present') present += 1;
      if (item.status === 'absent') absent += 1;
    });

    return { present, absent };
  }, [records]);

  return (
    <div className="card">
      <h2>Attendance Reports</h2>
      <p>Total Present: {summary.present}</p>
      <p>Total Absent: {summary.absent}</p>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record._id}>
              <td>{record.studentId?.name || 'Unknown'}</td>
              <td>{record.date}</td>
              <td>{record.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsPage;
