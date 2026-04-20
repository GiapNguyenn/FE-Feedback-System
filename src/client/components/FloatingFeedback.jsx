import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AiFeedbackModal from './AiFeedbackModal';
import LoginView from './LoginView';
import { Toaster } from 'react-hot-toast';
import { Pin, Trash2, MessageSquare, Plus, LogOut, Search } from 'lucide-react';
import SubmissionDashboard from './SubmissionDashboard';
import '../layout/FloatingFeedback.css';

const FloatingFeedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [loading, setLoading] = useState(false); // ĐÃ FIX: Thêm state loading ở đây
  const [isMaximized, setIsMaximized] = useState(false);
  // State để quản lý việc hiện bảng hỏi "Có muốn phân tích không?"
const [showAnalyzeConfirm, setShowAnalyzeConfirm] = useState(false);
// Lưu ID bài nộp vừa tạo để dùng cho việc phân tích sau đó
const [pendingSubId, setPendingSubId] = useState(null);
// State cho thông báo thuần túy (Success/Error)
const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // --- 1. TỰ ĐỘNG KHÔI PHỤC DỮ LIỆU ---
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setView('dashboard');
      fetchSubmissions(savedToken);
    }
  }, []);

  const fetchSubmissions = async (token) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Backend trả về { success: true, data: [...] }
      setSubmissions(res.data.data || []); 
    } catch (e) {
      toast.error("Lỗi load bài nộp:", e);
    }
  };

 const handleFileUpload = async (assignmentId, file) => {
  const token = localStorage.getItem('token');
  const config = { 
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'multipart/form-data' 
    } 
  };

  try {
    // setLoading(true);
    // setStatusMsg({ text: 'Đang kiểm tra và tải bài nộp...', type: 'info' });

    const formData = new FormData();
    formData.append('file', file);
    
    // Bước 1: Upload bài nộp
    const uploadRes = await axios.post('http://localhost:5000/api/submissions/upload', formData, config);
    const newSubId = uploadRes.data.submissionId;

    if (newSubId) {
      setStatusMsg({ text: 'Tải lên thành công! AI đang phân tích lỗi...', type: 'info' });
      
      // Bước 2: Tự động gọi hàm phân tích (AI quét lỗi)
      await handleAnalyzeExisting(newSubId);
      
      setStatusMsg({ text: 'Phân tích hoàn tất!', type: 'success' });
      
      // Cập nhật lại danh sách bên Sidebar ngay lập tức
      await fetchSubmissions(token); 

      // QUAN TRỌNG: Trả về ID để Dashboard biết và chủ động load Chat
      return newSubId; 
    }

  } catch (error) {
    console.error("Lỗi quá trình nộp bài:", error);
    const errorDetail = error.response?.data?.message || "Không thể hoàn thành tác vụ";
    setStatusMsg({ text: "Lỗi: " + errorDetail, type: 'error' });
    return null; // Trả về null nếu lỗi
  } finally {
    setLoading(false);
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
  }
};


const handleAnalyzeExisting = async (submissionId) => {
    if (!submissionId) return;
    setIsAnalyzing(true);
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
        // 1. Gọi API phân tích - Nhận luôn kết quả trả về từ Backend (res.data)
        const res = await axios.post(
            `http://localhost:5000/api/submissions/${submissionId}/analyze`, 
            {}, 
            config
        );

        // 2. Kiểm tra nếu Backend trả về success và có issues (lỗi)
        if (res.data && res.data.success) {
            // Dùng luôn dữ liệu vừa phân tích xong (không cần gọi thêm hàm GET history nữa)
            // Backend của bạn trả về: { success: true, analysisId, issues: [...] }
            setCurrentAnalysis(res.data); 
            
            // 3. Cập nhật Sidebar để đổi trạng thái sang 'done'
            await fetchSubmissions(token);
            
            // Trả về dữ liệu để hàm gọi nó (ở Dashboard) có thể dùng luôn
            return res.data;
        }
    } catch (error) {
        console.error("Lỗi phân tích:", error);
        // Lưu ý: Dùng toast.error nếu bạn dùng react-hot-toast
        toast.error("Lỗi: " + (error.response?.data?.message || "Không thể phân tích"));
    } finally {
        setIsAnalyzing(false);
    }
};

  return (
    
    <>
    <Toaster position="top-center" reverseOrder={false} />
      <div className="floating-button" onClick={() => setIsOpen(!isOpen)}>
        <span style={{ fontSize: '28px', color: 'white' }}>{isOpen ? '✕' : '💬'}</span>
      </div>

      {isOpen && (
        <AiFeedbackModal 
          onClose={() => setIsOpen(false)} 
          currentAnalysis={currentAnalysis}
          view={view}
          submissions={submissions}
          onConfirmSync={handleAnalyzeExisting}
          isAnalyzing={isAnalyzing}
          
          showSuccessToast={showSuccessToast} 
          title={view === 'dashboard' ? `SV: ${user?.fullName || user?.username}` : "Hệ thống Feedback"}
        >
  
        {statusMsg.text && (
          <div className={`status-toast ${statusMsg.type}`}>
            <div className="toast-content">
              {statusMsg.type === 'info' && <span className="spinner">🌀</span>}
              {statusMsg.type === 'error' && <span>❌ </span>}
              {statusMsg.type === 'success' && <span>✅ </span>}
              {statusMsg.text}
            </div>
          </div>
        )}

          
          {view === 'dashboard' && (
            <SubmissionDashboard 
              user={user} 
              submissions={submissions} 
              onLogout={() => {
                localStorage.clear(); 
                setView('landing');
                setUser(null);
                setSubmissions([]);
                setCurrentAnalysis(null);
              }} 
              currentAnalysis={currentAnalysis} 
              setCurrentAnalysis={setCurrentAnalysis}
              onAnalyze={handleAnalyzeExisting} 
              onUpload={handleFileUpload} 
              loading={loading} // Truyền loading xuống để Dashboard disable nút nộp
              fetchSubmissions={() => fetchSubmissions(localStorage.getItem('token'))}
            />
          )}

          {view === 'landing' && (
            <div className="landing-container">
              <h2>Chào mừng bạn!</h2>
              <button className="btn-primary-large" onClick={() => setView('login')}>Đăng nhập</button>
            </div>
          )}

          {view === 'login' && (
            <LoginView onLoginSuccess={(data) => {
                const { token, user: userProfile } = data;
                setUser(userProfile);
                localStorage.setItem('user', JSON.stringify(userProfile));
                localStorage.setItem('token', token);
                fetchSubmissions(token);
                setView('dashboard');
            }} onBack={() => setView('landing')} />
          )}
        </AiFeedbackModal>
      )}
    </>
  );
};

export default FloatingFeedback;