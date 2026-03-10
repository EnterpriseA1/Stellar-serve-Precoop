import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // เอาไว้โชว์ข้อความ Error
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ยิง API ไปที่ Backend
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      // ถ้าสำเร็จ เก็บ Token และข้อมูล User ลงเครื่อง
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('เข้าสู่ระบบสำเร็จ!');

      // แยกหน้าตาม Role ของ User (MVP: ส่งไปหน้า Home ก่อน)
      navigate('/home');

    } catch (err) {
      // ถ้า Error ให้ดึงข้อความจาก Backend มาโชว์
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-lg">
        <div className="text-center">
          <img src={logo} alt="StellarServe Logo" className="w-24 h-24 mx-auto mb-2" />
          <h2 className="text-3xl font-bold text-[#1a113d]">StellarServe</h2>
        </div>

        <h3 className="text-xl font-bold text-gray-800">Sign In</h3>

        {/* โชว์ Error ถ้ามี */}
        {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-5 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-3 bg-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-3 mt-4 font-bold text-white transition duration-200 rounded-full bg-[#1a113d] hover:bg-[#2d1e5e]">
            Sign In
          </button>
        </form>

        <div className="text-sm text-center text-gray-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold cursor-pointer text-[#1a113d] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}