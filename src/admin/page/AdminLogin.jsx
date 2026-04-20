import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Đặt tên biến là 'data' ở đây để bên dưới dùng được
      const data = await res.json(); 

      console.log("Dữ liệu từ Server:", data);

      if (!res.ok) {
        alert(data.message || "Đăng nhập thất bại");
        return;
      }

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        const userRole = data.user.role.toLowerCase();

        // CHỈNH SỬA Ở ĐÂY: Cho phép cả admin và teacher
        if (data.token && data.user) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role.toLowerCase());

  const userRole = data.user.role.toLowerCase();

          // Gom tất cả những ai là quản lý về trang Admin
          if (userRole === "admin" || userRole === "teacher") {
            navigate("/admin"); // Cả 2 cùng vào đây
          } else {
            alert("Sinh viên không có quyền vào đây!");
          }
        }
}
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert("Không thể kết nối đến server. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;