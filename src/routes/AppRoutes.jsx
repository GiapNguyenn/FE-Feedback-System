import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../admin/layout/AdminLayout";
import ClientLayout from "../client/layout/ClientLayout"; 

// Pages
import AdminLogin from "../admin/page/AdminLogin";
import AdminProtected from "./AdminProtected";
import Dashboard from "../admin/page/Dashboard";
import Users from "../admin/page/Users";
import Submissions from "../admin/page/Submissions";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= ROUTE CHO CLIENT ================= */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <h1>Web Hệ Thống</h1>
              <p>Hệ thống bài tập</p>
            </div>
          } />
          {/* Giáp có thể thêm các trang như /about, /contact ở đây */}
        </Route>

        {/* ================= ROUTE CHO LOGIN ADMIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ROUTE CHO ADMIN & TEACHER ================= */}
        {/* Dùng một Route cha để bảo vệ toàn bộ /admin. 
            Lưu ý: AdminProtected bao quanh AdminLayout là cách làm chuẩn nhất.
        */}
        <Route 
          path="/admin" 
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          {/* Trang mặc định khi vào /admin */}
          <Route index element={<Dashboard />} />
          
          {/* Các trang con: URL sẽ là /admin/users, /admin/assignments, ... */}
          <Route path="users" element={<Users />} />
          <Route path="submissions" element={<Submissions />} />
          
          {/* Route bổ sung cho Teacher nếu Giáp muốn dùng đường dẫn riêng */}
          <Route path="teacher-progress" element={<Users />} /> 
        </Route>

        {/* ================= XỬ LÝ KHI GÕ SAI URL ================= */}
        {/* <Route path="*" element={<Navigate to="/????" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;