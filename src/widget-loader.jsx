import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingFeedback from './client/components/FloatingFeedback';
import './client/layout/FloatingFeedback.css'; 

const initAiWidget = () => {
  // 1. Kiểm tra xem đã có cái root này chưa để tránh tạo trùng
  const rootId = 'ai-feedback-widget-root';
  if (document.getElementById(rootId)) return;

  // 2. Tạo một thẻ div mới và gắn vào cuối trang web khách
  const container = document.createElement('div');
  container.id = rootId;
  document.body.appendChild(container);

  // 3. Tiến hành vẽ Component vào cái div vừa tạo
  const root = ReactDOM.createRoot(container);
  root.render(<FloatingFeedback />);
};

// Tự động chạy lệnh khởi tạo
initAiWidget();