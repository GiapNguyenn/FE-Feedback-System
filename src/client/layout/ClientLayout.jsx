import { Outlet } from "react-router-dom";
import FloatingFeedback from "../components/FloatingFeedback"; // Component nút nổi bạn vừa tạo

function ClientLayout() {
  return (
    <div className="client-wrapper">
      {/* Header cho client nếu có */}
      <main>
        <Outlet /> {/* Đây là nơi nội dung các trang con của Client sẽ hiển thị */}
      </main>
      
      {/* Nút bấm nổi sẽ luôn hiển thị ở các trang Client */}
      <FloatingFeedback />
    </div>
  );
}

export default ClientLayout;