import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // TODO: เอาไว้ต่อ API Backend เพื่อเช็คสิทธิ์ภายหลัง
        console.log('กำลังล็อกอินด้วย:', username);

        // ชั่วคราว: พอกด Login ให้จำลองการเปลี่ยนหน้าไปที่ /home ก่อน
        navigate('/home');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#1a113d]">StellarServe</h2>
                </div>

                <h3 className="text-xl font-bold text-gray-800">Sign In</h3>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <input
                            type="text"
                            placeholder="Username / Phone Number"
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

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 font-bold text-white transition duration-200 rounded-full bg-[#1a113d] hover:bg-[#2d1e5e]"
                    >
                        Sign In
                    </button>
                </form>

                <div className="text-sm text-center text-gray-500">
                    Don't have an account?{' '}
                    <span className="font-bold cursor-pointer text-[#1a113d] hover:underline">
                        Sign Up
                    </span>
                </div>
            </div>
        </div>
    );
}