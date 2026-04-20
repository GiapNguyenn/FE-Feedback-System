import { useEffect, useState } from "react";
import styles from "../layout/Table.module.css"; 
import RoleFilter from "../components/RoleFilter";
import Swal from 'sweetalert2';
import styleUser from "../layout/User.module.css";
import { PlusCircle, FileSpreadsheet, ArrowLeft, Search, Edit } from 'lucide-react';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

function Users() {
  const [users, setUsers] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null); // Lưu lớp đang chọn
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false); // Modal tạo lớp
  const [newClassName, setNewClassName] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, totalPage: 1 });

  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role")?.toLowerCase();

  const [newUser, setNewUser] = useState({
    studentCode: "",
    email: "",
    fullName: "",
    password: "",
    roleId: currentRole === "admin" ? 3 : 2,
    classId: ""
  });

  // 1. Fetch danh sách lớp (Dành cho Teacher)
  const fetchClasses = () => {
    fetch("http://localhost:5000/api/users/teacher/classes", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTeacherClasses(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  // 2. Fetch danh sách sinh viên của một lớp cụ thể
const fetchStudentsByClass = (classId, page = 1, search = "") => {
  // 👈 QUAN TRỌNG: Thêm &search=${search} vào cuối URL
  fetch(`http://localhost:5000/api/users/teacher/class/${classId}/students?page=${page}&search=${search}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { currentPage: 1, totalPage: 1 });
      } else {
        setUsers(Array.isArray(res) ? res : []);
      }
    })
    .catch(err => console.error(err));
};

    // 4. Khi Giáo viên click vào 1 lớp
    const handleSelectClass = (cls) => {
      setSelectedClass(cls);
      setNewUser(prev => ({ ...prev, classId: cls.id }));
      fetchStudentsByClass(cls.id, 1); // Luôn về trang 1 khi chọn lớp mới
    };
  // 3. Fetch dữ liệu cho Admin (Lấy tất cả)
  const fetchAllUsers = () => {
    fetch("http://localhost:5000/api/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (currentRole === "teacher") {
      fetchClasses();
    } else {
      fetchAllUsers();
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const apiUrl = currentRole === "teacher" 
      ? "http://localhost:5000/api/users/teacher/create-student" 
      : "http://localhost:5000/api/users/admin/register-teacher";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        Toast.fire({ icon: 'success', title: 'Thêm thành công!' });
        setIsAddModalOpen(false);
        setNewUser({ ...newUser, studentCode: "", email: "", fullName: "", password: "" });
        if (selectedClass) fetchStudentsByClass(selectedClass.id);
        else fetchAllUsers();
      }
    } catch (err) { Toast.fire({ icon: 'error', title: 'Lỗi kết nối!' }); }
  };

  // 5. Hàm tạo lớp mới
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/teacher/create-class", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ className: newClassName }),
      });
      if (res.ok) {
        Toast.fire({ icon: 'success', title: 'Tạo lớp thành công!' });
        setIsCreateClassModalOpen(false);
        setNewClassName("");
        fetchClasses();
      }
    } catch (err) { console.error(err); }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", selectedClass.id); // Gửi kèm ID lớp đang chọn

    try {
        const res = await fetch("http://localhost:5000/api/users/teacher/upload-excel", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData, // FormData không cần Set Content-Type
        });

        const result = await res.json();
        if (res.ok) {
            Toast.fire({ icon: 'success', title: result.message });
            fetchStudentsByClass(selectedClass.id); // Load lại danh sách
        } else {
            Toast.fire({ icon: 'error', title: result.message });
        }
    } catch (err) {
        Toast.fire({ icon: 'error', title: "Lỗi upload file" });
    }
};

  return (
    
    <div className={styles.tableContainer}>
      {/* GIAO DIỆN CHO TEACHER CHƯA CHỌN LỚP */}
      {currentRole === "teacher" && !selectedClass ? (
        <div>
          <div className={styles.tableHeader}>
            <h2>Danh sách Lớp học của bạn</h2>
            <button className={styles.saveBtn} onClick={() => setIsCreateClassModalOpen(true)}>+ Tạo lớp mới</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {teacherClasses.map(cls => (
              <div key={cls.id} className={styles.classCard} onClick={() => handleSelectClass(cls)} 
                style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
                <h3>{cls.className}</h3>
                <p>Bấm để quản lý sinh viên</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* GIAO DIỆN BẢNG SINH VIÊN (Admin hoặc Teacher đã chọn lớp) */
        <div>
          <div className={styles.tableHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
    
            {/* NHÓM BÊN TRÁI: Nút quay lại + Tiêu đề */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {currentRole === "teacher" && (
                <button className={styleUser.backBtn} onClick={() => setSelectedClass(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowLeft size={18} />
                  Quay lại
                </button>
              )}
              <h2 style={{ margin: 0, whiteSpace: 'nowrap' }}>
                {selectedClass ? `Lớp: ${selectedClass.className}` : "Quản lý Người dùng"}
              </h2>
            </div>

            {/* NHÓM BÊN PHẢI: Search + Các nút chức năng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
              
              {/* Ô SEARCH CÓ ICON */}
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm theo MSSV..." 
                  className={styles.searchInput} 
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    fetchStudentsByClass(selectedClass.id, 1, value); 
                  }} 
                />
              </div>

              {/* NÚT THÊM SINH VIÊN */}
              <button onClick={() => setIsAddModalOpen(true)} className={styles.saveBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} />
                Thêm SV
              </button>

              {/* NÚT NHẬP EXCEL */}
              <label className={styles.saveBtn} style={{ backgroundColor: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FileSpreadsheet size={20} />
                Nhập Excel
                <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelUpload} />
              </label>

            </div>
          </div>

          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users

                .map((user) => (
                <tr key={user.id}>
                  <td>{user.studentCode}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td><button className={styles.editBtn}>Sửa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* BỘ NÚT PHÂN TRANG */}
          {pagination.totalPage > 1 && (
            <div className={styleUser.paginationContainer}>
              {/* Nút Trước */}
              <button 
                disabled={pagination.currentPage <= 1}
                onClick={() => fetchStudentsByClass(selectedClass.id, pagination.currentPage - 1, searchTerm)} // 👈 Thêm searchTerm
                className={styleUser.pageBtn}
              >
                Trước
              </button>

              {/* Các nút số */}
              {[...Array(pagination.totalPage)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => fetchStudentsByClass(selectedClass.id, index + 1, searchTerm)} // 👈 Thêm searchTerm
                  className={`${styleUser.pageBtn} ${pagination.currentPage === index + 1 ? styleUser.activePage : ''}`}
                >
                  {index + 1}
                </button>
              ))}

              {/* Nút Sau */}
              <button 
                disabled={pagination.currentPage >= pagination.totalPage}
                onClick={() => fetchStudentsByClass(selectedClass.id, pagination.currentPage + 1, searchTerm)} // 👈 Thêm searchTerm
                className={styleUser.pageBtn}
              >
                Sau
              </button>
            </div>
          )}
        </div> 
      )}

      {/* MODAL TẠO LỚP */}
      {isCreateClassModalOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.editForm} onSubmit={handleCreateClass}>
            <h3>Tạo lớp học mới</h3>
            <input required placeholder="Tên lớp (VD: Lập trình Web - K15)" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
            <div className={styles.editFormActions}>
              <button type="submit" className={styles.saveBtn}>Tạo lớp</button>
              <button type="button" onClick={() => setIsCreateClassModalOpen(false)} className={styles.cancelBtn}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL THÊM SINH VIÊN */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <form className={styles.editForm} onSubmit={handleRegister}>
            <h3>{selectedClass ? `Thêm SV vào lớp ${selectedClass.className}` : "Đăng ký Giáo viên"}</h3>
            <input required placeholder="Mã số" value={newUser.studentCode} onChange={e => setNewUser({...newUser, studentCode: e.target.value})} />
            <input required placeholder="Họ tên" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
            <input required type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <input required type="password" placeholder="Mật khẩu" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <div className={styles.editFormActions}>
              <button type="submit" className={styles.saveBtn}>Lưu lại</button>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelBtn}>Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Users;