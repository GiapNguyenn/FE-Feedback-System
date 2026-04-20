import React, { useState } from 'react';
import '../layout/LoginView.css'
import axios from 'axios';

const LoginView = ({ onLoginSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: localStorage.getItem('saved_email') || '',
    password: '',
    remember: !!localStorage.getItem('saved_email')
  });

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', {
        email: form.email,
        password: form.password
      });

      // res.data lúc này là: { message, token, user: {...} }
      const { token, user } = res.data;
      const mssv = user.studentCode || user.studentcode;

      if (!mssv) throw new Error("Tài khoản thiếu studentCode!");

      // Ghi nhớ email nếu cần
      if (form.remember) localStorage.setItem('saved_email', form.email);
      else localStorage.removeItem('saved_email');

      // QUAN TRỌNG: Truyền res.data (chứa token) thay vì chỉ truyền user
      onLoginSuccess(res.data, mssv); 
      
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h4>Đăng nhập sinh viên</h4>
      <input type="email" placeholder="Email" value={form.email}
        onChange={e => setForm({...form, email: e.target.value})} required />
      <input type="password" placeholder="Mật khẩu" value={form.password}
        onChange={e => setForm({...form, password: e.target.value})} required />
      <label className="remember-me">
        <input type="checkbox" checked={form.remember}
          onChange={e => setForm({...form, remember: e.target.checked})} /> Nhớ email
      </label>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Đang xác thực...' : 'Đăng nhập'}
      </button>
      <button type="button" className="btn-back" onClick={onBack}>Quay lại</button>
    </form>
  );
};

export default LoginView;