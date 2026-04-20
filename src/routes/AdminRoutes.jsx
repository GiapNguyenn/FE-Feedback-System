import { Routes, Route } from "react-router-dom";
import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/page/Dashboard";


function AdminRoutes() {
  return (
    <Routes> 
      <Route path="/" element={<AdminLayout />}> 
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="StudentProgress" element={<StudentProgress />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;