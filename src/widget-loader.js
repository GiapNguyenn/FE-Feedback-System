import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingFeedback from './client/components/FloatingFeedback';
import './layout/FloatingFeedback.css'; // Đảm bảo đường dẫn CSS đúng

const initWidget = () => {
  const id = 'ai-feedback-widget-root';
  if (document.getElementById(id)) return;

  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<FloatingFeedback />);
};

initWidget();