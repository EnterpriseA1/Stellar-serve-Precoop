import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import logo from '../assets/logo.png';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // เอาไว้โชว์ข้อความ Error
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ยิง API ไปที่ Backend
      const res = await axios.post('/auth/login', {
        username,
        password
      });

      // ถ้าสำเร็จ เก็บ Token และข้อมูล User ลงเครื่อง
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      setShowSuccess(true);

      // หน่วงเวลาให้เห็น Popup 1.5 วินาที แล้วแยกหน้าตาม Role ของ User
      setTimeout(() => {
        navigate('/home');
      }, 1500);

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

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center p-8 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mb-4 text-5xl text-green-500 bg-green-100 rounded-full">
              ✨
            </div>
            <h3 className="text-2xl font-bold text-[#1a113d]">เข้าสู่ระบบสำเร็จ!</h3>
            <p className="mt-2 text-sm text-gray-500 font-medium">กำลังพาท่านเข้าสู่ระบบ...</p>
          </div>
        </div>
      )}
    </div>
  );
}