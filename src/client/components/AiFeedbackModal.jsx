import React, { useState, useRef } from 'react';
import { List, X, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'; // Thêm icon
import '../layout/AiFeedbackModal.css';

const AiFeedbackModal = ({ onClose, title, children, view, submissions, onConfirmSync, isAnalyzing, showSuccessToast }) => {
  const [showList, setShowList] = useState(false);
  const [tempSelected, setTempSelected] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false); // State quản lý phóng to
  const itemRefs = useRef([]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    /* Thêm class động 'maximized' vào div cha */
<div className={`feedback-panel ${isMaximized ? 'maximized' : ''}`}>
      
      {/* 1. OVERLAY RADAR */}
      {showSuccessToast && (
        <div className="analysis-success-toast">
          <div className="toast-icon">✅</div>
          <div className="toast-text">Đã phân tích xong bài tập!</div>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="analysis-loading-overlay">
          <div className="radar-box">
            <div className="radar-sweep"></div>
            <div className="radar-scan-line"></div>
          </div>
          <p style={{marginTop: '15px', fontWeight: 'bold', color: '#6366f1'}}>AI ĐANG PHÂN TÍCH...</p>
        </div>
      )}

      {/* 2. HEADER TÍM */}
      <div className="panel-header-purple">
        <div className="header-left">
          {view === 'dashboard' && (
            <div 
              className={`menu-toggle ${showList ? 'active' : ''}`}
              onClick={() => setShowList(!showList)}
            >
              <List size={22} color="white" />
            </div>
          )}
        </div>
        
        <div className="header-center">
          <h3 className="header-title">{title}</h3>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* --- NÚT PHÓNG TO / THU NHỎ --- */}
          <div onClick={toggleMaximize} style={{ cursor: 'pointer' }}>
            {isMaximized ? (
              <Minimize2 size={20} color="white" title="Thu nhỏ" />
            ) : (
              <Maximize2 size={20} color="white" title="Phóng to" />
            )}
          </div>
          
          {/* NÚT ĐÓNG (Nếu bạn muốn có nút X ở đây) */}
          <div onClick={onClose} style={{ cursor: 'pointer' }}>
             <X size={22} color="white" />
          </div>
        </div>
      </div>

      {/* 3. DROPDOWN DANH SÁCH BÀI TẬP */}
      <div className={`dropdown-submission-list ${showList ? 'show' : ''}`}>
  {submissions?.map((item, idx) => {
    const isSelected = tempSelected === idx;

    return (
      <div
        key={item.id || idx}
        ref={(el) => (itemRefs.current[idx] = el)}
        className={`submission-item-container ${isSelected ? 'selected' : ''}`}
      >
        {/* ROW CLICK */}
        <div
          className="submission-row-main"
         onClick={() => {
            setTempSelected(isSelected ? null : idx);

            setTimeout(() => {
              itemRefs.current[idx]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', // 🔥 QUAN TRỌNG
              });
            }, 50);
          }}
        >
          <div className="item-text">
            <span className="item-title">
              {item.FileName || "Bài tập"}
            </span>
            <br />
            <small>
              {item.Language} —{" "}
              {new Date(item.CreatedAt).toLocaleDateString()}
            </small>
          </div>

          {/* 👇 BỊ THIẾU CÁI NÀY */}
          <div className="item-icon">
            {isSelected ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        </div>

        {/* 👇 BỊ THIẾU LUÔN KHÚC NÀY */}
        <div className="confirm-zone-inner">
          <p>Bạn có muốn phân tích bài này?</p>

          <div className="confirm-btns">
            <button
              className="btn-inner-cancel"
              onClick={(e) => {
                e.stopPropagation();
                setTempSelected(null);
              }}
            >
              Hủy
            </button>

            <button
              className="btn-inner-confirm"
              onClick={(e) => {
                e.stopPropagation();
                onConfirmSync(item.id);
                setShowList(false);
                setTempSelected(null);
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>

      {/* 4. NỘI DUNG CHÍNH */}
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
};

export default AiFeedbackModal;