import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NavbarRestaurant from '../components/NavbarRestaurant';

export default function Home() {
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('home'); // จัดการ State ว่าตอนนี้อยู่แท็บไหน ('home', 'search', 'profile')
    const navigate = useNavigate();

    useEffect(() => {
        // เช็คว่ามีข้อมูล User ในเครื่องไหม (ล็อกอินหรือยัง)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/'); // ถ้ายังไม่ล็อกอิน ให้เด้งกลับไปหน้า Sign In
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    if (!user) return <div className="p-10 text-center font-bold text-[#1a113d]">Loading...</div>;

    return (
        <div className="relative min-h-screen pb-20 bg-gray-50">

            {/* -------------------- พื้นที่ส่วนแสดงผลหลัก (Body) -------------------- */}
            <div>
                {currentTab === 'home' && (
                    // ถ้าอยู่หน้า Home ให้แสดง Dashboard ตาม Role เหมือนเดิม
                    <>
                        <div className="bg-[#1a113d] text-white p-6 rounded-b-3xl shadow-md flex justify-between items-center">
                            <div>
                                <h1 className="text-xl font-bold">Hello, {user.name}</h1>
                                <p className="inline-block px-2 py-1 mt-1 text-sm text-yellow-400 capitalize bg-white/20 rounded-lg">
                                    {user.role}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {user.role === 'customer' && <CustomerDashboard />}
                            {user.role === 'restaurant' && <RestaurantDashboard />}
                        </div>
                    </>
                )}

                {/* ถ้าอยู่แท็บ Search จะแสดงหน้านี้ (โครงร่างจำลองไว้ก่อน) */}
                {currentTab === 'search' && <SearchPage />}

                {/* ถ้าอยู่แท็บ Profile จะแสดงหน้านี้ */}
                {currentTab === 'profile' && <ProfilePage user={user} />}
            </div>

            {/* Navbar แยกตาม role */}
            {user.role === 'restaurant'
                ? <NavbarRestaurant currentTab={currentTab} setCurrentTab={setCurrentTab} />
                : <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
            }

        </div>
    );
}

// ==========================================
// ส่วน Components หน้าจอรอง (Search, Profile)
// ==========================================

function SearchPage() {
    return (
        <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-[#1a113d]">Search</h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder="ค้นหาร้านอาหาร หรือ เมนู..."
                    className="w-full px-5 py-3 pl-10 bg-white shadow-sm border-none rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <span className="absolute top-3 left-4 text-gray-400">🔍</span>
            </div>
            <div className="mt-8 text-center text-gray-400">
                <p>พิมพ์คำค้นหาเพื่อเริ่ม</p>
            </div>
        </div>
    );
}

function ProfilePage({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-[#1a113d]">My Profile</h2>
            <div className="p-6 text-center bg-white rounded-3xl shadow-sm mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                    👤
                </div>
                <h3 className="text-xl font-bold">{user.name}</h3>
                <p className="text-gray-500">@{user.username}</p>
                <p className="mt-2 text-sm font-bold text-yellow-500 uppercase">{user.role}</p>
            </div>

            <div className="space-y-3">
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Account Settings</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>
                <button className="w-full p-4 text-left bg-white rounded-2xl shadow-sm font-bold flex justify-between">
                    <span>Help Center</span>
                    <span className="text-gray-400">{'>'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full p-4 mt-6 font-bold text-center text-white bg-red-500 rounded-full shadow hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

// ==========================================
// ส่วน Components ของ Dashboard ตาม Role (เหมือนเดิม)
// ==========================================

function CustomerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center h-32 shadow-sm bg-yellow-300 rounded-2xl">
                <h2 className="text-2xl font-bold text-[#1a113d]">Special Offers!</h2>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">Category</h3>
                <div className="grid grid-cols-4 gap-3 text-sm font-bold text-center">
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍔 Burger</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍕 Pizza</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍽️ อื่นๆ</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍣 Sushi</div>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">Near Me</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex gap-4 p-4 bg-white shadow-sm rounded-2xl">
                            <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">Restaurant Name {item}</h4>
                                <p className="text-sm text-gray-500">📍 123 Street, Bangkok City</p>
                                <p className="text-sm font-bold text-yellow-500">⭐ 4.5</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RestaurantDashboard() {
    return (
        <div className="space-y-6">
            <div className="p-6 text-white shadow-lg bg-gradient-to-r from-[#1a113d] to-[#2d1e5e] rounded-3xl">
                <p className="text-sm opacity-80">Total Earning</p>
                <h2 className="mt-1 text-4xl font-bold text-yellow-400">฿ 1,200</h2>
                <p className="mt-2 text-sm">10 Food Orders</p>
            </div>

            <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl text-xs font-bold text-center text-[#1a113d] w-full">
                <span className="mb-1 text-2xl">🍔</span> Menu
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">New Orders</h3>
                <div className="space-y-3">
                    {[1, 2].map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div>
                                <h4 className="font-bold">Order #00{item}</h4>
                                <p className="text-sm text-gray-500">2x Burger, 1x Sandwich</p>
                            </div>
                            <button className="px-4 py-2 text-sm font-bold bg-yellow-400 rounded-full text-[#1a113d]">
                                Accept
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
