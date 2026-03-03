import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function SignUp() {
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', phone: '', role: 'customer'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            alert('สมัครสมาชิกสำเร็จ! กรุณาล็อกอิน');
            navigate('/'); // สมัครเสร็จเด้งกลับไปหน้า Sign In
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-lg">
                <h2 className="text-3xl font-bold text-center text-[#1a113d]">StellarServe</h2>
                <h3 className="text-xl font-bold text-gray-800">Sign Up</h3>

                {error && <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">{error}</div>}

                <form className="space-y-4" onSubmit={handleRegister}>
                    <input type="text" name="username" placeholder="Username" required
                        autoCapitalize="none" autoComplete="username"
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onChange={handleChange} />

                    <input type="password" name="password" placeholder="Password" required
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onChange={handleChange} />

                    <input type="text" name="name" placeholder="Full Name (ชื่อ-สกุล / ชื่อร้าน)" required
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onChange={handleChange} />

                    <input type="tel" name="phone" placeholder="Phone Number" required
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onChange={handleChange} />

                    <select name="role" value={formData.role} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer">
                        <option value="customer">Customer (ลูกค้า)</option>
                        <option value="restaurant">Restaurant (ร้านอาหาร)</option>
                        <option value="rider">Delivery Personnel (ไรเดอร์)</option>
                    </select>

                    <button type="submit" className="w-full py-3 font-bold text-[#1a113d] transition duration-200 rounded-full bg-yellow-400 hover:bg-yellow-500">
                        Sign Up
                    </button>
                </form>

                <div className="text-sm text-center text-gray-500">
                    Already have an account?{' '}
                    <Link to="/" className="font-bold cursor-pointer text-[#1a113d] hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}