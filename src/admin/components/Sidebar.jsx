import { NavLink } from "react-router-dom";
import styles from "../layout/Sidebar.module.css";

function Sidebar() {
  // 1. Lấy role từ localStorage (ví dụ bạn lưu là "admin" hoặc "teacher")
  const userRole = localStorage.getItem("role")?.toLowerCase();

  // 2. Định nghĩa toàn bộ menu và phân quyền (roles)
  const menuItems = [
    { path: "/admin", label: "Dashboard", roles: ["admin", "teacher"] },
    { path: "/admin/users", label: "Users", roles: ["admin" , "teacher" ] }, // Chỉ Admin thấy // Chỉ Teacher thấy
    { path: "/admin/submissions", label: "Submissions", roles: ["admin", "teacher"] },
    { path: "/admin/StudentProgress", label: "StudentProgress", roles: ["teacher"] },
  ];

  // 3. Lọc danh sách menu dựa trên role hiện tại của người dùng
  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={styles.sidebarContainer}>
      {/* Hiển thị tiêu đề động theo Role */}
      <h2 className={styles.title}>
        {userRole === "admin" ? "Admin Panel" : "Teacher Panel"}
      </h2>

      <ul className={styles.menuList}>
        {filteredMenu.map((item) => (
          <li key={item.path} className={styles.menuItem}>
            <NavLink 
              to={item.path}
              end={item.path === "/admin"}   
              className={({ isActive }) => 
                isActive 
                  ? `${styles.navLink} ${styles.activeLink}` 
                  : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;