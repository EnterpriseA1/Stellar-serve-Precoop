import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import logo from '../assets/logo.png';

export default function SignUp() {
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', phone: '', role: 'customer', address: '', category: 'other'
    });
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('/auth/register', formData);
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-lg">
                <div className="text-center">
                    <img src={logo} alt="StellarServe Logo" className="w-24 h-24 mx-auto mb-2" />
                    <h2 className="text-3xl font-bold text-[#1a113d]">StellarServe</h2>
                </div>
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
                    </select>

                    {/* แสดง field Address และ Category เฉพาะตอนเลือกเป็นร้านอาหาร */}
                    {formData.role === 'restaurant' && (
                        <>
                            <input type="text" name="address" placeholder="ที่อยู่ร้าน (เช่น 55 Silom, Bangkok)" required
                                className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                onChange={handleChange} />

                            <select name="category" value={formData.category} onChange={handleChange}
                                className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer">
                                <option value="burger">🍔 Burger</option>
                                <option value="pizza">🍕 Pizza</option>
                                <option value="sushi">🍣 Sushi</option>
                                <option value="other">🍽️ อื่นๆ</option>
                            </select>
                        </>
                    )}

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

            {/* Success Popup */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
                    <div className="flex flex-col items-center p-8 bg-white shadow-2xl rounded-3xl">
                        <div className="flex items-center justify-center w-20 h-20 mb-4 text-5xl text-green-500 bg-green-100 rounded-full">
                            ✨
                        </div>
                        <h3 className="text-2xl font-bold text-[#1a113d]">สมัครสมาชิกสำเร็จ!</h3>
                        <p className="mt-2 text-sm text-gray-500 font-medium">กรุณาล็อกอินเพื่อเข้าสู่ระบบ...</p>
                    </div>
                </div>
            )}
        </div>
    );
}