import React, { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import '../layout/UserSetting.css';

const UserSetting = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="user-setting-wrapper">
      {/* Hình tròn Avatar */}
      <div className="avatar-circle" onClick={() => setIsOpen(!isOpen)}>
        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
      </div>

      {/* Menu thả xuống */}
      {isOpen && (
        <>
          <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
          <div className="user-dropdown-menu">
            <div className="user-info-header">
              <p className="user-name">{user?.fullName}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <hr />
            <button className="menu-item">
              <Settings size={16} /> <span>Cài đặt tài khoản</span>
            </button>
            <button className="menu-item logout" onClick={onLogout}>
              <LogOut size={16} /> <span>Đăng xuất</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserSetting;