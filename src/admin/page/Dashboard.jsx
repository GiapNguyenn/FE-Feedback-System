import React, { useEffect, useState, useCallback } from 'react';
// ... (giữ nguyên các import Recharts của bạn) ...
import styles from '../layout/Dashboard.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

function Dashboard() {
  const [data, setData] = useState({
    overview: {}, languages: [], trends: [], topErrors: [], recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Lấy role để hiển thị tiêu đề động
  const userRole = localStorage.getItem("role")?.toLowerCase();

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
        setData(result);
      }
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return <div className={styles.loading}>Đang tải thống kê...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2>{userRole === 'admin' ? 'Hệ thống Quản trị (Admin)' : 'Quản lý Lớp học (Teacher)'}</h2>
        <p>{userRole === 'admin' ? 'Thống kê toàn bộ hoạt động AI Feedback.' : 'Thống kê tiến độ nộp bài của lớp.'}</p>
      </div>

      {/* 1. Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Sinh viên {userRole === 'teacher' && 'của bạn'}</p>
          <h3>{data.overview?.totalStudents || 0}</h3>
        </div>
        <div className={styles.statCard}>
          <p>Bài đã nộp</p>
          <h3>{data.overview?.totalSubmissions || 0}</h3>
        </div>
        <div className={styles.statCard}>
          <p>Số lớp {userRole === 'admin' ? 'hệ thống' : 'đang dạy'}</p>
          <h3>{data.overview?.totalAssignments || 0}</h3>
        </div>
        <div className={styles.statCard} style={{ borderBottom: '4px solid #ef4444' }}>
          <p>Lỗi AI phát hiện</p>
          <h3 style={{ color: '#ef4444' }}>{data.overview?.totalErrors || 0}</h3>
        </div>
      </div>

      {/* 2. Biểu đồ */}
      <div className={styles.chartsGrid}>
        {/* Top 5 lỗi phổ biến */}
        <div className={styles.chartBox}>
          <h4>Top 5 lỗi sinh viên thường gặp nhất</h4>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topErrors} layout="vertical" margin={{ left: 30, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ ngôn ngữ */}
        <div className={styles.chartBox}>
          <h4>Ngôn ngữ lập trình</h4>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.languages} innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" nameKey="name">
                   {data.languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Bảng dữ liệu bài nộp mới nhất */}
      <div className={styles.tableBox} style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ marginBottom: '15px' }}>{userRole === 'admin' ? 'Toàn bộ bài nộp mới' : 'Bài nộp mới từ lớp của bạn'}</h4>
        <table className={styles.customTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '12px' }}>Sinh viên</th>
              <th style={{ padding: '12px' }}>Ngôn ngữ</th>
              <th style={{ padding: '12px' }}>Số lỗi</th>
              <th style={{ padding: '12px' }}>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {data.recentSubmissions?.map((sub, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{sub.studentName}</td>
                <td style={{ padding: '12px' }}><span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{sub.language}</span></td>
                <td style={{ padding: '12px', color: '#ef4444', fontWeight: 'bold' }}>{sub.errorCount} lỗi</td>
                <td style={{ padding: '12px', fontSize: '13px', color: '#94a3b8' }}>{new Date(sub.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;