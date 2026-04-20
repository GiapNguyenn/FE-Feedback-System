import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Pin, Trash2, MessageSquare } from 'lucide-react';
import { useNotify } from '../../hooks/useNotify';
import UserSetting from '../components/UserSetting';
import '../layout/SubmissionDashboard.css';

const SubmissionDashboard = ({ user, submissions, onLogout, currentAnalysis, setCurrentAnalysis, onAnalyze, onUpload ,fetchSubmissions }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetAssignmentId, setTargetAssignmentId] = useState('');
  const [loading, setLoading] = useState(false); // Đã có state loading
  const { notifySuccess, notifyError, confirmAction } = useNotify();

  // Tự động cuộn xuống
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  

  // Kết quả phân tích mới
useEffect(() => {
  if (currentAnalysis && currentAnalysis.issues) {
    // 1. Luôn ưu tiên nhảy sang tab chat
    setActiveTab('chat');  
  }
}, [currentAnalysis, messages.length]);


  const handleSendMessage = async () => {
  // Kiểm tra kỹ ID trước khi gửi
  if (!chatInput.trim() || !currentAnalysis?.analysisId) {
    console.error("Thiếu nội dung chat hoặc Analysis ID");
    return;
  }

  const userMsg = {
    sender: 'user',
    text: chatInput,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  setMessages(prev => [...prev, userMsg]);
  const currentInput = chatInput;
  setChatInput('');
  setIsTyping(true);

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `http://localhost:5000/api/analysis/${currentAnalysis.analysisId}/chat`, 
      { question: currentInput }, // ĐẢM BẢO DÙNG 'question' VÌ BACKEND ĐANG ĐỢI KEY NÀY
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const aiReply = {
      sender: 'ai',
      text: res.data.answer, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiReply]);
  } catch (err) {
    console.error("Lỗi chat chi tiết:", err.response?.data || err.message);
    notifyError("AI gặp sự cố khi trả lời, vui lòng thử lại!");
  } finally {
    setIsTyping(false);
  }
};


const handleSelectHistory = async (submissionId) => {
  if (!submissionId) return;

  // TẠO BIẾN CỜ HIỆU TRONG PHẠM VI HÀM
  let isCancelled = false;

  // Dọn sạch ngay lập tức để user thấy đang load bài mới
  setMessages([]);
  setCurrentAnalysis(null);
  setIsTyping(true);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const resAnalysis = await axios.get(`http://localhost:5000/api/analysis/history/${submissionId}`, config);
    console.log("Dữ liệu phân tích trả về:", resAnalysis.data);
    // Nếu trong lúc chờ API mà user đã click bài khác, dừng lại luôn
    if (isCancelled) return; 

    if (resAnalysis.data) {
      const analysisData = resAnalysis.data;
      const resChat = await axios.get(`http://localhost:5000/api/analysis/${analysisData.analysisId}/chat`, config);
      
      if (isCancelled) return; // Kiểm tra lại lần nữa sau API chat
      const rawHistory = resChat.data.chatHistory || resChat.data;
      setCurrentAnalysis(analysisData);

       let formatted = [];

      if (Array.isArray(rawHistory) && rawHistory.length > 0) {

        const chatMessages = rawHistory.map((msg) => ({
          sender: msg.role === 'ai' ? 'ai' : 'user',
          text: msg.message,
          issues: null,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        formatted = [
          {
            sender: 'ai',
            text: `Kết quả phân tích cho bài: **${analysisData.assignmentTitle}**`,
            issues: analysisData.issues || [],
            time: ''
          },
          ...chatMessages
        ];

      } else {
        formatted = [{
          sender: 'ai',
          text: `Kết quả phân tích cho bài: **${analysisData.assignmentTitle}**`,
          issues: analysisData.issues || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }

      setMessages(formatted);
    }
  } catch (err) {
    console.error("Lỗi load bài:", err);
  } finally {
    if (!isCancelled) setIsTyping(false);
  }

  // Hàm dọn dẹp (Nếu cần dùng trong useEffect)
  return () => { isCancelled = true; };
};


const handleDelete = async (subId) => {
    // Thay window.confirm bằng confirmAction (SweetAlert2)
    const isConfirmed = await confirmAction(
      'Xác nhận xoá?', 
      'Toàn bộ lịch sử phân tích và chat của bài này sẽ bị mất!',
      'Xoá ngay'
    );

    if (!isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/submissions/${subId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Thông báo thành công bằng Toast
      notifySuccess("Đã xoá bài nộp thành công");
      fetchSubmissions(); 
    } catch (err) {
      // Thông báo lỗi bằng Toast
      notifyError("Lỗi khi xoá dữ liệu");
    }
  };

  // --- HÀM GHIM MỚI ---
  const handlePin = async (subId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`http://localhost:5000/api/submissions/${subId}/pin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      notifySuccess("Đã cập nhật trạng thái ghim");
      fetchSubmissions(); 
    } catch (err) {
      notifyError("Không thể ghim bài nộp");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h4>FeedBack</h4>
        </div>
        <button onClick={() => setActiveTab('list')} className="new-chat-btn">
          + Bài nộp mới
        </button>
        
        <div className="history-items">
          {submissions && submissions.map((sub, idx) => (
            <div 
              key={sub.id || idx} 
              className={`history-link-container ${currentAnalysis?.submissionId === sub.id ? 'active' : ''}`}
            >
              {/* Click vào vùng này để xem lịch sử */}
              <div className="history-main-content" onClick={() => handleSelectHistory(sub.id)}>
                <span className="icon">
                  <MessageSquare size={16} />
                </span>
                <div className="history-info">
                  <p className="file-name">{sub.FileName || "Bài nộp"}</p>
                  <small>{sub.Language}</small>
                </div>
              </div>

              {/* Cụm nút chức năng hiện lên khi hover */}
              <div className="history-actions">
                <button 
                  className={`btn-action-pin ${sub.IsPinned ? 'pinned' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation(); // Không cho nhảy vào handleSelectHistory
                    handlePin(sub.id);
                  }}
                  title={sub.IsPinned ? "Bỏ ghim" : "Ghim"}
                >
                  <Pin size={14} fill={sub.IsPinned ? "currentColor" : "none"} />
                </button>
                
                <button 
                  className="btn-action-delete" 
                  onClick={(e) => {
                    e.stopPropagation(); // Không cho nhảy vào handleSelectHistory
                    handleDelete(sub.id);
                  }}
                  title="Xoá bài nộp"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <UserSetting user={user} onLogout={onLogout} />
      </aside>

      {/* MAIN CONTENT */}
          <main className="dashboard-main">
        {activeTab === 'list' ? (
          <div className="list-view-container">
            <h3>Danh sách tệp hiện có</h3>
            
            {/* --- VÙNG CUỘN DANH SÁCH --- */}
            <div className="submissions-scroll-area">
              <div className="submissions-grid">
                {submissions.map((item, idx) => (
                  <div key={idx} className="submission-card-modern">
                    <div className="card-body">
                      <h5>{item.FileName}</h5>
                      <small>{item.Language}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* --- KHỐI UPLOAD (CỐ ĐỊNH Ở DƯỚI) --- */}
            <div className="upload-section-modern">
              <div className="upload-controls">
                <input 
                  type="file" 
                  id="file-upload" 
                  style={{ display: 'none' }} 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                />
                
                <label htmlFor="file-upload" className="btn-choose-file">
                  {selectedFile ? ` ${selectedFile.name}` : " Chọn file "}
                </label>

                <button 
                  className="btn-submit-now"
                  disabled={!selectedFile || loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const result = await onUpload(null, selectedFile); 
                      if (result && result.issues) {
                        setActiveTab('chat');
                        setMessages([{
                          sender: 'ai',
                          text: `Mình đã phân tích xong bài: **${result.assignmentTitle || 'Mới nộp'}**`,
                          issues: result.issues,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }]);
                      }
                      setSelectedFile(null);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Đang nộp..." : "Phân tích"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- VIEW CHAT AI --- */
          <div className="chat-ai-container" key={currentAnalysis?.analysisId || 'loading'} >
            <div className="chat-header-info">
              <strong>AI Assistant</strong>
              <small>Đang xem: {currentAnalysis?.assignmentTitle || "Đang tải..."}</small>
            </div>

            <div className="chat-messages-area" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`message-row ${msg.sender}`}>
                  <div className="message-bubble">
                    {msg.sender === 'ai' ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="msg-text">{msg.text}</p>
                    )}

                      {msg.issues && Array.isArray(msg.issues) && msg.issues.length > 0 && (
                  <div className="issues-analysis-card">
                    <p className="card-tag">Gợi ý chi tiết</p>
                    {msg.issues.map((issue, idx) => (
                      <div key={idx} className="issue-item">
                        {/* Chỉ hiện số dòng cho gọn */}
                        <div className="line-number" style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '4px' }}>
                          Dòng {issue.LineNumber || 0}
                        </div>
                        
                        {/* Message đã có sẵn [File: ...] bên trong nên hiện thẳng luôn */}
                        <p className="error-text" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                          <b>❌ Lỗi:</b> {issue.Message}
                        </p>

                        <div className="suggestion-box">
                          <div className="fix-content">
                            <span style={{ fontSize: '14px' }}>💡 <b>Gợi ý:</b></span>
                            {issue.Suggestion?.split('->').map((part, pIdx, arr) => {
                              const text = part.trim();
                              
                              // Nếu là phần ở giữa (thường là giải thích), hiển thị kiểu khác
                              const isExplanation = pIdx === 1 && arr.length === 3; 

                              return (
                                <React.Fragment key={pIdx}>
                                  {isExplanation ? (
                                    <span className="explain-text">{text}</span>
                                  ) : (
                                    <code className="code-highlight">{text}</code>
                                  )}
                                  {pIdx < arr.length - 1 && <span className="arrow-sep"> ➜ </span>}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message-row ai">
                  <div className="message-bubble typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                    AI đang suy nghĩ...
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-sticky">
              <div className="input-group-messenger">
                <input 
                      value={chatInput || ""} 
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Hỏi AI thêm về lỗi này..." 
                    />
                <button className="btn-send-msg" onClick={handleSendMessage}>➤</button>
              </div>
            </div>
          </div> // Đóng chat-ai-container
        )}
      </main>
    </div>
  );
};

export default SubmissionDashboard;