import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // เช็คว่ามีข้อมูล User ในเครื่องไหม (ล็อกอินหรือยัง)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/'); // ถ้ายังไม่ล็อกอิน ให้เตะกลับไปหน้า Sign In
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return <div className="p-10 text-center font-bold">Loading...</div>;

    // โครงสร้างหลักของหน้าจอ
    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            {/* Header Profile ด้านบน */}
            <div className="bg-[#1a113d] text-white p-6 rounded-b-3xl shadow-md flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Hello, {user.name}</h1>
                    <p className="text-sm text-yellow-400 capitalize bg-white/20 inline-block px-2 py-1 rounded-lg mt-1">
                        {user.role}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-bold text-white transition bg-red-500 rounded-full shadow hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="p-6">
                {/* แยกการแสดงผลตาม Role */}
                {user.role === 'customer' && <CustomerDashboard />}
                {user.role === 'restaurant' && <RestaurantDashboard />}
                {user.role === 'rider' && <RiderDashboard />}
            </div>
        </div>
    );
}

// ==========================================
// 1. Dashboard สำหรับ "ลูกค้า (Customer)"
// ==========================================
function CustomerDashboard() {
    return (
        <div className="space-y-6">
            {/* ป้ายประกาศ (Banner) */}
            <div className="flex items-center justify-center h-32 shadow-sm bg-yellow-300 rounded-2xl">
                <h2 className="text-2xl font-bold text-[#1a113d]">Special Offers!</h2>
            </div>

            {/* หมวดหมู่อาหาร */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Category</h3>
                <div className="grid grid-cols-4 gap-3 text-sm font-bold text-center">
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍔 Burger</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍕 Pizza</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍖 BBQ</div>
                    <div className="p-3 bg-white shadow-sm rounded-xl">🍣 Sushi</div>
                </div>
            </div>

            {/* ร้านอาหารใกล้ฉัน (Mock data) */}
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

// ==========================================
// 2. Dashboard สำหรับ "ร้านอาหาร (Restaurant)"
// ==========================================
function RestaurantDashboard() {
    return (
        <div className="space-y-6">
            {/* สรุปรายได้ */}
            <div className="p-6 text-white shadow-lg bg-gradient-to-r from-[#1a113d] to-[#2d1e5e] rounded-3xl">
                <p className="text-sm opacity-80">Total Earning</p>
                <h2 className="mt-1 text-4xl font-bold text-yellow-400">฿ 1,200</h2>
                <p className="mt-2 text-sm">10 Food Orders</p>
            </div>

            {/* เมนูจัดการร้าน (ปุ่มกดจำลอง) */}
            <div className="grid grid-cols-4 gap-3 text-xs font-bold text-center text-[#1a113d]">
                <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl">
                    <span className="mb-1 text-2xl">📋</span> Orders
                </div>
                <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl">
                    <span className="mb-1 text-2xl">🍔</span> Menu
                </div>
                <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl">
                    <span className="mb-1 text-2xl">💳</span> Payment
                </div>
                <div className="flex flex-col items-center p-3 bg-white shadow-sm rounded-xl">
                    <span className="mb-1 text-2xl">❓</span> Help
                </div>
            </div>

            {/* ออเดอร์ที่เข้ามาใหม่ */}
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

// ==========================================
// 3. Dashboard สำหรับ "คนขับ (Rider)"
// ==========================================
function RiderDashboard() {
    return (
        <div className="space-y-6">
            {/* สรุปสถิติคนขับ */}
            <div className="p-6 text-center bg-white shadow-sm rounded-3xl">
                <p className="text-sm text-gray-500">Total Distance</p>
                <h2 className="mt-1 text-4xl font-bold text-[#1a113d]">150 KM</h2>
                <p className="mt-2 text-sm font-bold text-yellow-500">⭐ 4.8 | Orders: 10</p>
            </div>

            {/* งานที่รอรับ */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Available Orders (Inbox)</h3>
                <div className="space-y-3">
                    {[1, 2].map((item) => (
                        <div key={item} className="p-4 space-y-2 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <h4 className="font-bold">Order #00{item}</h4>
                                <span className="font-bold text-green-600">ค่าส่ง ฿ 45</span>
                            </div>
                            <p className="text-sm text-gray-600">🏪 <b>From:</b> Burger Shop</p>
                            <p className="text-sm text-gray-600">📍 <b>To:</b> Customer Address</p>
                            <button className="w-full mt-2 py-2 font-bold text-white transition bg-[#1a113d] rounded-xl hover:bg-[#2d1e5e]">
                                Accept Delivery
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}