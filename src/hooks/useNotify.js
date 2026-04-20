import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export const useNotify = () => {
  
  // 1. Thông báo Toast nhanh (Góc màn hình)
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);
  const notifyLoading = (msg) => toast.loading(msg);

  // 2. Thông báo lỗi nghiêm trọng (Dạng Modal)
  const alertError = (title, text) => {
    Swal.fire({
      icon: 'error',
      title: title || 'Lỗi!',
      text: text || 'Đã có lỗi xảy ra, vui lòng thử lại.',
      confirmButtonColor: '#3085d6',
    });
  };

  // 3. Hàm Xác nhận YES/NO (Dùng cho Xóa, Đăng xuất...)
const confirmAction = async (title, text, confirmText = 'Xác nhận') => {
    const result = await Swal.fire({
      title: title || 'Bạn có chắc chắn?',
      text: text || 'Hành động này không thể hoàn tác!',
      iconColor: '#fab1a0', // Màu cam nhạt pastel
      width: '320px',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Hủy bỏ',
      reverseButtons: false,
      
      // QUAN TRỌNG: Tắt style mặc định để dùng CSS cá nhân
      buttonsStyling: false, 
      
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-text',
        confirmButton: 'swal-confirm-btn-blue',
        cancelButton: 'swal-cancel-btn'
      },
      // Để hiện bên trong khung chat (nếu muốn)
      target: document.querySelector('.feedback-panel') || 'body'
    });
    return result.isConfirmed;
  };
  return { notifySuccess, notifyError, notifyLoading, alertError, confirmAction, toast };
};