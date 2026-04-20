import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../layout/Table.module.css';
import modalStyles from '../layout/FeedbackModal.module.css';
import { Sparkles, Save, X, ClipboardCheck } from 'lucide-react';

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // State quản lý nhận xét (3 thành phần)
  const [feedbackData, setFeedbackData] = useState({
    weakness: "",
    strengths: "",
    comment: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000/api";

  // 1. Lấy danh sách bài nộp
useEffect(() => {
    const initData = async () => {
        setLoading(true); 
        try {
            // 1. Lấy danh sách lớp cho Dropdown
            const resClasses = await axios.get(`${API_URL}/feedback/classes`, { 
                headers: { "Authorization": `Bearer ${token}` } 
            });
            if (resClasses.data.success) {
                setClasses(resClasses.data.data);
            }

            // 2. QUAN TRỌNG: Gọi hàm này để lấy bài nộp ngay khi vào trang
            await fetchSubmissions(""); 

        } catch (err) {
            console.error("Lỗi khi load trang:", err);
            // Nếu lỗi 404 ở trên, ít nhất vẫn cho tắt loading để hiện bảng trống
            setLoading(false); 
        } finally {
            setLoading(false); // Tắt dòng "Đang tải..."
        }
    };

    initData();
}, []);

//1. fetchSubmissions để nhận tham số classId
const fetchSubmissions = async (classId = "") => {
    setLoading(true);
    const url = classId ? `${API_URL}/feedback/admin/all?classId=${classId}` : `${API_URL}/feedback/admin/all`;
    const res = await axios.get(url, { headers: { "Authorization": `Bearer ${token}` } });
    setSubmissions(res.data.data);
    setLoading(false);
};


  // 2. Gọi AI lấy bản nháp (Draft)
  const handleGetAIDraft = async (subId) => {
    setIsAnalyzing(true);
    try {
      const res = await axios.get(`${API_URL}/feedback/draft/${subId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.data.success) {
        setFeedbackData(res.data.draft);
      }
    } catch (err) {
      alert("Lỗi khi AI phân tích bài tập!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3. Lưu chính thức (Duyệt)
  const handleSaveOfficial = async () => {
    try {
      await axios.post(`${API_URL}/feedback/save`, {
        submissionId: selectedSub.id,
        weakness: feedbackData.weakness,
        strengths: feedbackData.strengths,
        comment: feedbackData.comment
      }, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      alert("🚀 Đã phê duyệt và gửi nhận xét!");
      setSelectedSub(null);
      fetchSubmissions(); // Cập nhật lại bảng
    } catch (err) {
      alert("Lỗi khi lưu nhận xét chính thức");
    }
  };
const filteredSubmissions = submissions.filter((sub) => {
  // Chuyển tất cả về chữ thường để so sánh không phân biệt hoa thường
  const name = sub.studentName ? sub.studentName.toLowerCase() : "";
  const code = sub.studentCode ? sub.studentCode.toLowerCase() : "";
  const file = sub.assignmentTitle ? sub.assignmentTitle.toLowerCase() : ""; // Thêm tìm theo tên file
  const search = searchTerm.toLowerCase();

  // Trả về kết quả nếu khớp với Tên SV HOẶC MSSV HOẶC Tên File
  return name.includes(search) || code.includes(search) || file.includes(search);
});

  if (loading) return <p className={styles.loading}>Đang tải danh sách bài nộp...</p>;

  return (
    <div className={styles.tableContainer}>
      <h2>Quản lý bài nộp</h2>

     <div className={modalStyles.filterSection}>
        {/* Cụm lọc theo lớp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={modalStyles.filterLabel}>Lớp:</span>
          <select 
            value={selectedClass} 
            onChange={(e) => {
              setSelectedClass(e.target.value);
              fetchSubmissions(e.target.value);
            }}
            className={modalStyles.classSelect}
          >
            <option value="">-- Tất cả các lớp --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.className}</option>
            ))}
          </select>
        </div>

        {/* Cụm tìm kiếm (Nằm bên phải) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={modalStyles.filterLabel}>Tìm kiếm:</span>
            <input 
              type="text"
              placeholder="Tìm tên SV, MSSV hoặc tên file..." // Sửa lại placeholder cho rõ ràng
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={modalStyles.classSelect}
              style={{ minWidth: '300px' }} 
            />
        </div>
      </div>

      <table className={styles.customTable}>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Sinh viên</th>
            <th>Lớp</th> 
            <th>Bài tập</th>
            <th>Ngôn ngữ</th>
            <th>Lỗi AI</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td style={{ fontWeight: '600' }}>{sub.studentCode}</td>
                <td>{sub.studentName}</td>
                <td className={styles.classColumn}>{sub.className || "N/A"}</td>
                <td>{sub.assignmentTitle}</td>
                <td>{sub.language}</td>
                <td style={{ color: 'red', fontWeight: 'bold' }}>{sub.errorCount}</td>
                <td>
                  <span className={sub.status === 'Đã nhận xét' ? styles.statusDone : styles.statusPending}>
                     {sub.status || "Chờ xử lý"}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => { 
                      setSelectedSub(sub); 
                      setFeedbackData({ weakness: "", strengths: "", comment: "" }); 
                    }}
                    className={styles.editBtn}
                  >
                    <ClipboardCheck size={16} />Phân tích
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className={styles.noDataRow}>
                Không tìm thấy bài nộp nào cho lớp này.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL PHÊ DUYỆT NHẬN XÉT */}
      {selectedSub && (
        <div className={modalStyles.modalOverlay}>
          <div className={modalStyles.modalContent} style={{ width: '650px' }}>
            <div className={modalStyles.modalHeader}>
              <h3>Chấm bài: {selectedSub.studentName}</h3>
              <button className={modalStyles.closeBtn} onClick={() => setSelectedSub(null)}><X /></button>
            </div>
            
            <div className={modalStyles.studentInfo}>
              <p><b>MSSV:</b> {selectedSub.studentCode} | <b>Bài:</b> {selectedSub.assignmentTitle}</p>
            </div>

            {/* Nút gọi AI */}
            <button 
              onClick={() => handleGetAIDraft(selectedSub.id)} 
              className={modalStyles.aiBtn}
              disabled={isAnalyzing}
            >
              <Sparkles size={18} />
              {isAnalyzing ? "AI đang phân tích..." : "Lấy gợi ý từ AI "}
            </button>

            <div className={modalStyles.feedbackForm}>
              <div className={modalStyles.feedbackField}>
                <label>⚠️ Điểm yếu kiến thức:</label>
                <textarea 
                  value={feedbackData.weakness}
                  onChange={(e) => setFeedbackData({...feedbackData, weakness: e.target.value})}
                  rows="3"
                />
              </div>

              <div className={modalStyles.feedbackField}>
                <label>✅ Điểm tốt:</label>
                <textarea 
                  value={feedbackData.strengths}
                  onChange={(e) => setFeedbackData({...feedbackData, strengths: e.target.value})}
                  rows="2"
                />
              </div>

              <div className={modalStyles.feedbackField}>
                <label>💬 Lời phê giảng viên:</label>
                <textarea 
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                  rows="4"
                  placeholder="Thầy nhắn nhủ gì cho em không?"
                />
              </div>
            </div>

            <div className={modalStyles.modalActions}>
              <button onClick={handleSaveOfficial} className={modalStyles.saveBtn}>
                <Save size={18} /> Duyệt & Gửi
              </button>
              <button onClick={() => setSelectedSub(null)} className={modalStyles.cancelBtn}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSubmissions;