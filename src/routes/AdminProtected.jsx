// AdminProtected.jsx
import { Navigate } from "react-router-dom";

function AdminProtected({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  if (!token) return <Navigate to="/admin/login" />;

  // Nếu Route yêu cầu một Role cụ thể (ví dụ chỉ Admin mới được vào Quản lý người dùng)
  if (requiredRole && role !== requiredRole) {
    // Nếu không đúng quyền, đá về trang Dashboard chung hoặc Login
    return <Navigate to="/admin" />; 
  }

  // Cho phép Teacher và Admin vào các trang cơ bản
  const allowedRoles = ["admin", "teacher"];
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
export default AdminProtected;