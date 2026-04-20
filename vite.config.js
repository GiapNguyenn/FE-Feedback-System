import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    // CÁCH NÀY MẠNH HƠN: Định nghĩa cả object process
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({ NODE_ENV: 'production' }),
    'process': JSON.stringify({ env: { NODE_ENV: 'production' } }),
  },
      build: {
      lib: {
        // SỬA DÒNG NÀY: Trỏ vào file widget-loader.jsx vừa tạo
        entry: path.resolve(__dirname, 'src/widget-loader.jsx'), 
        name: 'AiFeedbackWidget',
        fileName: (format) => `ai-feedback-widget.${format}.js`,
      },
      rollupOptions: {
        // QUAN TRỌNG: Để mảng này RỖNG [] để nó đóng gói luôn React vào file build
        // Như vậy trang web khác không có React vẫn chạy được bong bóng của bạn
        external: [], 
      },
    },
});