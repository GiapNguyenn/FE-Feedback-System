import { NavLink } from "react-router-dom";
import styles from "../layout/Sidebar.module.css";
import { LayoutDashboard, Users, FileText, Inbox } from "lucide-react";

function Sidebar() {
  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18}/> },
    { path: "/admin/users", label: "Users", icon: <Users size={18}/> },
    { path: "/admin/assignments", label: "Assignments", icon: <FileText size={18}/> },
    { path: "/admin/submissions", label: "Submissions", icon: <Inbox size={18}/> },
  ];

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.title}>Admin Panel</h2>

      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li key={item.path} className={styles.menuItem}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => 
                isActive 
                  ? `${styles.navLink} ${styles.activeLink}` 
                  : styles.navLink
              }
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;