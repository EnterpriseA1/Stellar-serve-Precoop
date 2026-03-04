import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NavbarRestaurant from '../components/NavbarRestaurant';

export default function Home() {
    const [user, setUser] = useState(null);
    const [currentTab, setCurrentTab] = useState('home');
    const [cart, setCart] = useState([]); // cart state
    const navigate = useNavigate();

    // เพิ่มสินค้าลงตะกร้า
    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === item.id);
            if (existing) {
                return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    // ลดจำนวนหรือลบออกจากตะกร้า
    const removeFromCart = (itemId) => {
        setCart(prev => {
            const existing = prev.find(c => c.id === itemId);
            if (existing?.qty === 1) return prev.filter(c => c.id !== itemId);
            return prev.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c);
        });
    };

    const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

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
                            {user.role === 'customer' && <CustomerDashboard addToCart={addToCart} />}
                            {user.role === 'restaurant' && <RestaurantDashboard />}
                        </div>
                    </>
                )}

                {currentTab === 'cart' && <CartPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} setCurrentTab={setCurrentTab} clearCart={() => setCart([])} user={user} />}

                {currentTab === 'search' && <SearchPage />}
                {currentTab === 'orders' && (
                    user.role === 'restaurant' ? <RestaurantOrdersPage user={user} /> : <MyOrdersPage user={user} />
                )}
                {currentTab === 'menu' && <MenuManagePage user={user} />}
                {currentTab === 'profile' && <ProfilePage user={user} />}
            </div>

            {/* Navbar แยกตาม role */}
            {user.role === 'restaurant'
                ? <NavbarRestaurant currentTab={currentTab} setCurrentTab={setCurrentTab} />
                : <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} cartCount={cartCount} />
            }

        </div>
    );
}

// ==========================================
// ส่วน Components หน้าจอรอง (Search, Profile)
// ==========================================

const STATUS_LABEL = {
    pending: { text: '⏳ รอร้านกดรับ', color: 'bg-yellow-100 text-yellow-700' },
    preparing: { text: '🍳 กำลังปรุง', color: 'bg-blue-100 text-blue-700' },
    ready: { text: '✅ พร้อมส่ง', color: 'bg-green-100 text-green-700' },
    delivering: { text: '🛵 กำลังส่ง', color: 'bg-purple-100 text-purple-700' },
    completed: { text: '🎉 สำเร็จ', color: 'bg-gray-100 text-gray-700' },
    cancelled: { text: '❌ ยกเลิก', color: 'bg-red-100 text-red-500' },
};

function MyOrdersPage({ user }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user?.id) return;
        fetch(`http://localhost:5000/api/orders/customer/${user.id}`)
            .then(res => res.json())
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div className="p-10 text-center text-gray-400">⏳ กำลังโหลด...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">📋</span>
                <p className="font-bold">ยังไม่มีออเดอร์</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">📋 My Orders</h2>
            {orders.map(order => {
                const s = STATUS_LABEL[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-700' };
                return (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[#1a113d] text-sm">
                                {order.restaurantId?.name || 'ร้านอาหาร'}
                            </p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.text}</span>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                            {order.items.map((item, i) => (
                                <p key={i}>• {item.name} x{item.quantity} — ฿{item.price * item.quantity}</p>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#1a113d] border-t pt-2">
                            <span>Total</span>
                            <span>฿ {order.totalPrice}</span>
                        </div>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('th-TH')}</p>
                    </div>
                );
            })}
        </div>
    );
}

function RestaurantOrdersPage({ user }) {
    const [orders, setOrders] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const fetchOrders = React.useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/orders/restaurant/${user.id}`);
            const data = await res.json();
            // ไม่แสดง pending เพราะ pending จะแสดงที่หน้า Home (Dashboard) รอรับออเดอร์
            setOrders(Array.isArray(data) ? data.filter(o => o.status !== 'pending') : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    React.useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders();
        } catch (err) {
            console.error('อัปเดตสถานะไม่สำเร็จ:', err);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400">⏳ กำลังโหลด...</div>;

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">📋</span>
                <p className="font-bold">ยังไม่มีออเดอร์ที่กำลังดำเนินการ</p>
            </div>
        );
    }

    // ลำดับสถานะ
    const getNextStatusBtn = (currentStatus) => {
        switch (currentStatus) {
            case 'preparing':
                return <button onClick={() => handleUpdateStatus('delivering')} className="px-4 py-2 mt-3 w-full font-bold text-white bg-purple-500 rounded-xl hover:bg-purple-600">🛵 กำลังจัดส่ง</button>;
            case 'delivering':
                return <button onClick={() => handleUpdateStatus('completed')} className="px-4 py-2 mt-3 w-full font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-900">🎉 จัดส่งสำเร็จ</button>;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 space-y-4 pb-24">
            <h2 className="text-2xl font-bold text-[#1a113d]">📋 ออเดอร์ที่กำลังดำเนินการ</h2>
            {orders.map(order => {
                const s = STATUS_LABEL[order.status] || { text: order.status, color: 'bg-gray-100 text-gray-700' };
                return (
                    <div key={order._id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-[#1a113d] text-sm">
                                ลูกค้า: {order.customerId?.name || 'ไม่ระบุ'}
                            </p>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.text}</span>
                        </div>
                        {order.deliveryAddress && (
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">📍 {order.deliveryAddress}</p>
                        )}
                        <div className="text-sm text-gray-500 space-y-1">
                            {order.items.map((item, i) => (
                                <p key={i}>• {item.name} x{item.quantity}</p>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#1a113d] border-t pt-3">
                            <span>ราคาสุทธิ</span>
                            <span>฿ {order.totalPrice}</span>
                        </div>

                        {/* ปุ่มเปลี่ยนสถานะ (ส่ง id พร้อม status ใหม่) */}
                        {(() => {
                            switch (order.status) {
                                case 'preparing':
                                    return <button onClick={() => handleUpdateStatus(order._id, 'delivering')} className="w-full py-3 mt-2 font-bold text-white bg-purple-500 rounded-xl shadow-md active:scale-95 transition">🛵 กำลังจัดส่ง</button>;
                                case 'delivering':
                                    return <button onClick={() => handleUpdateStatus(order._id, 'completed')} className="w-full py-3 mt-2 font-bold text-white bg-gray-800 rounded-xl shadow-md active:scale-95 transition">🎉 จัดส่งสำเร็จ</button>;
                                default:
                                    return null; // completed แล้วจะไม่มีปุ่มให้กด
                            }
                        })()}
                    </div>
                );
            })}
        </div>
    );
}

function MenuManagePage({ user }) {
    const [menu, setMenu] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);

    // Form State
    const [formData, setFormData] = React.useState({ name: '', description: '', price: '', category: 'other' });

    // ดึงเมนูของร้านตัวเอง
    const fetchMenu = React.useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/items/restaurant/${user.id}`);
            const data = await res.json();
            setMenu(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('ดึงข้อมูลเมนูไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, [user]);

    React.useEffect(() => { fetchMenu(); }, [fetchMenu]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (item) => {
        setEditingId(item._id);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || 'other'
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', category: 'other' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.price) {
            setError('กรุณากรอกชื่อและราคา');
            return;
        }

        try {
            if (editingId) {
                // อัปเดตเมนู
                const res = await fetch(`http://localhost:5000/api/items/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error('แก้ไขเมนูไม่สำเร็จ');
            } else {
                // เพิ่มเมนูใหม่
                const res = await fetch('http://localhost:5000/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, restaurantId: user.id })
                });
                if (!res.ok) throw new Error('เพิ่มเมนูไม่สำเร็จ');
            }
            handleCancelEdit(); // ล้างฟอร์ม
            fetchMenu(); // ดึงข้อมูลใหม่
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูนี้?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/items/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('ลบเมนูไม่สำเร็จ');
            setMenu(prev => prev.filter(item => item._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#1a113d]">🍔 จัดการเมนู</h2>

            {/* ฟอร์มเพิ่ม/แก้ไข */}
            <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-[#1a113d]">{editingId ? '✏️ แก้ไขเมนู' : '✨ เพิ่มเมนูใหม่'}</h3>
                {error && <p className="text-sm text-red-500 font-bold">{error}</p>}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อเมนู <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="เช่น พิซซ่าฮาวายเอี้ยน" required />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียด</label>
                    <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="เช่น แป้งบางกรอบ เครื่องแน่น" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">ราคา (บาท) <span className="text-red-500">*</span></label>
                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="199" min="0" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-700 mb-1">หมวดหมู่</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400">
                            <option value="burger">Burger</option>
                            <option value="pizza">Pizza</option>
                            <option value="sushi">Sushi</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#1a113d] rounded-xl hover:bg-[#2d1e5e] transition shadow-md">
                        {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={handleCancelEdit} className="px-6 py-3 font-bold text-gray-600 bg-gray-200 rounded-xl hover:bg-gray-300 transition">
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>

            {/* รายการเมนูทั้งหมด */}
            <div className="space-y-3">
                <h3 className="font-bold text-[#1a113d] flex justify-between items-end">
                    <span>รายการเมนูของร้าน</span>
                    <span className="text-sm font-normal text-gray-500">{menu.length} รายการ</span>
                </h3>

                {loading ? (
                    <div className="text-center text-gray-400 py-6">⏳ กำลังโหลด...</div>
                ) : menu.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl shadow-sm">
                        <p className="text-3xl mb-2">🍽️</p>
                        <p className="font-bold">ยังไม่มีเมนู</p>
                    </div>
                ) : (
                    menu.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div className="flex-1 mr-4">
                                <h4 className="font-bold text-[#1a113d] text-lg">{item.name}</h4>
                                {item.description && <p className="text-sm text-gray-500 leading-tight my-1">{item.description}</p>}
                                <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                                    <span className="text-yellow-600">฿ {item.price}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg capitalize">{item.category}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleEditClick(item)} className="px-4 py-2 text-xs font-bold bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition">
                                    ✏️ แก้ไข
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="px-4 py-2 text-xs font-bold bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
                                    🗑️ ลบ
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

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

function CustomerDashboard({ addToCart }) {
    const [selectedRestaurant, setSelectedRestaurant] = React.useState(null);
    const [restaurants, setRestaurants] = React.useState([]);
    const [menu, setMenu] = React.useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = React.useState(true);
    const [loadingMenu, setLoadingMenu] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState(null);

    // ดึงรายชื่อร้านอาหารจาก API
    React.useEffect(() => {
        setLoadingRestaurants(true);
        fetch('http://localhost:5000/api/auth/restaurants')
            .then(res => res.json())
            .then(data => setRestaurants(data))
            .catch(err => console.error(err))
            .finally(() => setLoadingRestaurants(false));
    }, []);

    // ดึงเมนูของร้านที่เลือก
    const handleSelectRestaurant = async (restaurant) => {
        setLoadingMenu(true);
        setSelectedRestaurant(restaurant);
        try {
            const res = await fetch(`http://localhost:5000/api/items/restaurant/${restaurant._id}`);
            const data = await res.json();
            setMenu(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('ดึงเมนูไม่สำเร็จ', err);
        } finally {
            setLoadingMenu(false);
        }
    };

    // หน้าเมนูของร้านที่เลือก
    if (selectedRestaurant) {
        return (
            <div className="space-y-4">
                {/* ปุ่มย้อนกลับ & ชื่อร้าน */}
                <div className="p-4 bg-white shadow-sm rounded-2xl">
                    <button
                        onClick={() => { setSelectedRestaurant(null); setMenu([]); }}
                        className="text-yellow-400 text-sm font-bold mb-2 flex items-center gap-1"
                    >
                        ← กลับ
                    </button>
                    <h3 className="text-xl font-bold text-[#1a113d]">{selectedRestaurant.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">📍 {selectedRestaurant.address || 'ไม่ระบุที่อยู่'}</p>
                    <p className="text-xs text-gray-500">📞 {selectedRestaurant.phone}</p>
                </div>
                <h4 className="text-lg font-bold text-[#1a113d]">เมนู</h4>

                {loadingMenu && (
                    <div className="text-center text-gray-400 py-8">⏳ กำลังโหลดเมนู...</div>
                )}

                {!loadingMenu && menu.length === 0 && (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🍽️</p>
                        <p className="font-bold">ร้านนี้ยังไม่มีเมนู</p>
                    </div>
                )}

                <div className="space-y-3">
                    {menu.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">🍽️</span>
                                <div>
                                    <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                    {item.description && (
                                        <p className="text-xs text-gray-400">{item.description}</p>
                                    )}
                                    <p className="text-sm font-bold text-yellow-600">฿ {item.price}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCart({ ...item, id: item._id, restaurantId: selectedRestaurant._id, restaurantName: selectedRestaurant.name })}
                                className="w-9 h-9 flex items-center justify-center bg-yellow-400 rounded-full text-[#1a113d] font-bold text-xl hover:bg-yellow-500 transition"

                            >
                                +
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const categories = [
        { id: 'burger', icon: '🍔', label: 'Burger' },
        { id: 'pizza', icon: '🍕', label: 'Pizza' },
        { id: 'sushi', icon: '🍣', label: 'Sushi' },
        { id: 'other', icon: '🍽️', label: 'อื่นๆ' },
    ];

    const filteredRestaurants = selectedCategory
        ? restaurants.filter(r => r.category === selectedCategory || (!r.category && selectedCategory === 'other'))
        : restaurants;

    return (
        <div className="space-y-6">
            {/* Banner */}
            <div className="flex items-center justify-center h-32 shadow-sm bg-yellow-300 rounded-2xl">
                <h2 className="text-2xl font-bold text-[#1a113d]">Special Offers!</h2>
            </div>

            {/* Category */}
            <div>
                <h3 className="mb-3 text-lg font-bold">Category</h3>
                <div className="grid grid-cols-4 gap-3 text-sm font-bold text-center">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`p-3 shadow-sm rounded-xl cursor-pointer transition-colors ${selectedCategory === cat.id ? 'bg-[#1a113d] text-white' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <div className="text-xl mb-1">{cat.icon}</div>
                            <div className="truncate">{cat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* รายการร้านอาหาร */}
            <div>
                <h3 className="mb-3 text-lg font-bold">
                    {selectedCategory ? `ร้านอาหารหมวดหมู่ ${categories.find(c => c.id === selectedCategory)?.label}` : 'ร้านอาหารทั้งหมด'}
                </h3>

                {loadingRestaurants && (
                    <div className="text-center text-gray-400 py-8">⏳ กำลังโหลด...</div>
                )}

                {!loadingRestaurants && filteredRestaurants.length === 0 && (
                    <div className="text-center text-gray-400 py-8 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🏪</p>
                        <p className="font-bold">ยังไม่มีร้านอาหารในหมวดหมู่นี้</p>
                    </div>
                )}

                <div className="space-y-3">
                    {filteredRestaurants.map((restaurant) => (
                        <div
                            key={restaurant._id}
                            onClick={() => handleSelectRestaurant(restaurant)}
                            className="flex gap-4 p-4 bg-white shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition"
                        >
                            <div className="w-20 h-20 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl">
                                🏪
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{restaurant.name}</h4>
                                {restaurant.address && (
                                    <p className="text-sm text-gray-500">📍 {restaurant.address}</p>
                                )}
                                <p className="text-sm text-gray-500">📞 {restaurant.phone}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



function CartPage({ cart, addToCart, removeFromCart, setCurrentTab, clearCart, user }) {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const [ordering, setOrdering] = React.useState(false);
    const [orderError, setOrderError] = React.useState('');
    const [step, setStep] = React.useState('cart'); // 'cart' หรือ 'address'
    const [address, setAddress] = React.useState(user?.address || '');

    // รวมกลุ่มร้านค้า (อาจมีหลายร้านในตะกร้า)
    const restaurantId = cart[0]?._id ? null : cart[0]?.restaurantId;

    const handleProceed = () => {
        setStep('address');
    };

    const handleConfirmOrder = async () => {
        if (!user) return;
        if (!address.trim()) {
            setOrderError('กรุณากรอกที่อยู่สำหรับจัดส่ง');
            return;
        }

        // ดึง restaurantId จาก item แรกใน cart
        const firstItem = cart[0];
        const rId = firstItem?.restaurantId || null;
        if (!rId) {
            setOrderError('ไม่พบข้อมูลร้านอาหาร กรุณาเพิ่มสินค้าใหม่');
            return;
        }
        setOrdering(true);
        setOrderError('');
        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: user.id,
                    restaurantId: rId,
                    items: cart.map(item => ({
                        itemId: item._id || item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.qty
                    })),
                    totalPrice: total + 30,
                    deliveryAddress: address
                })
            });
            const data = await res.json();
            if (!res.ok) {
                setOrderError(data.message || 'สั่งออเดอร์ไม่สำเร็จ');
                return;
            }
            clearCart();
            setCurrentTab('orders');
        } catch (err) {
            setOrderError('เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่');
        } finally {
            setOrdering(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <span className="text-5xl">🛒</span>
                <p className="font-bold">Cart is empty</p>
                <button
                    onClick={() => setCurrentTab('home')}
                    className="mt-2 px-6 py-2 bg-yellow-400 text-[#1a113d] font-bold rounded-full hover:bg-yellow-500 transition"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    if (step === 'address') {
        return (
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setStep('cart')} className="text-xl">{'<'}</button>
                    <h2 className="text-2xl font-bold text-[#1a113d]">Delivery Details</h2>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
                    <label className="block text-sm font-bold text-gray-700">ที่อยู่จัดส่งของคุณ</label>
                    <textarea
                        className="w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        rows="3"
                        placeholder="กรอกที่อยู่จัดส่งแบบละเอียด (เช่น บ้านเลขที่ ซอย จุดสังเกต)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                </div>

                {orderError && <p className="text-sm text-red-500 font-bold text-center">⚠️ {orderError}</p>}

                {/* คำเตือนเรื่องการชำระเงิน */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-xs text-yellow-800 text-center font-medium">
                    ⚠️ <span className="font-bold text-red-600">โปรดทราบ:</span> ชำระเงินด้วย <span className="font-bold underline">เงินสด</span> กับไรเดอร์ของร้านค้าเท่านั้น ณ วันจัดส่ง
                </div>

                <button
                    onClick={handleConfirmOrder}
                    disabled={ordering}
                    className={`w-full py-4 font-bold text-white rounded-2xl shadow-md transition
                        ${ordering ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a113d] hover:bg-[#2d1e5e]'}`}
                >
                    {ordering ? '⏳ กำลังสั่ง...' : 'Confirm Order'}
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#1a113d]">🛒 Cart</h2>

            <div className="space-y-3">
                {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white shadow-sm rounded-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🍽️</span>
                            <div>
                                <h4 className="font-bold text-[#1a113d]">{item.name}</h4>
                                <p className="text-sm text-gray-500">฿ {item.price} x {item.qty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition">-</button>
                            <span className="font-bold w-5 text-center">{item.qty}</span>
                            <button onClick={() => addToCart?.(item)}
                                className="w-8 h-8 flex items-center justify-center bg-yellow-400 rounded-full font-bold hover:bg-yellow-500 transition">+</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-white rounded-2xl shadow-sm space-y-2">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>฿ {total}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Delivery Fee</span><span>฿ 30</span></div>
                <div className="flex justify-between font-bold text-[#1a113d] border-t pt-2 mt-2"><span>Total</span><span>฿ {total + 30}</span></div>
            </div>

            <button
                onClick={handleProceed}
                className="w-full py-4 font-bold text-white rounded-2xl shadow-md transition bg-[#1a113d] hover:bg-[#2d1e5e]"
            >
                Proceed to Checkout
            </button>
        </div>
    );
}

function RestaurantDashboard() {
    const [isOpen, setIsOpen] = React.useState(null);
    const [toggling, setToggling] = React.useState(false);
    const [toggleError, setToggleError] = React.useState('');
    const [pendingOrders, setPendingOrders] = React.useState([]);
    const [loadingOrders, setLoadingOrders] = React.useState(true);

    const storedUser = JSON.parse(localStorage.getItem('user'));

    const fetchOrders = () => {
        if (!storedUser?.id) return;
        setLoadingOrders(true);
        fetch(`http://localhost:5000/api/orders/restaurant/${storedUser.id}`)
            .then(res => res.json())
            .then(data => {
                const pending = Array.isArray(data) ? data.filter(o => o.status === 'pending') : [];
                setPendingOrders(pending);
            })
            .catch(err => console.error(err))
            .finally(() => setLoadingOrders(false));
    };

    const handleOrderStatus = async (orderId, status) => {
        try {
            await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchOrders(); // รีโหลดออเดอร์หลังอัปเดต
        } catch (err) {
            console.error('อัปเดตสถานะไม่สำเร็จ:', err);
        }
    };

    // โหลดสถานะจาก API ตรงๆ
    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) return;

        fetch(`http://localhost:5000/api/auth/restaurants/${stored.id}/status`)
            .then(res => res.json())
            .then(data => {
                if (typeof data.isOpen === 'boolean') setIsOpen(data.isOpen);
            })
            .catch(() => {
                const val = stored.isOpen;
                setIsOpen(typeof val === 'boolean' ? val : true);
            });

        fetchOrders();
    }, []);

    const handleToggle = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) return;
        setToggling(true);
        setToggleError('');
        try {
            const res = await fetch(
                `http://localhost:5000/api/auth/restaurants/${storedUser.id}/toggle`,
                { method: 'PATCH' }
            );
            const data = await res.json();
            if (!res.ok) {
                setToggleError(data.message || 'ไม่สามารถเปลี่ยนสถานะได้');
                return;
            }
            setIsOpen(data.isOpen);
            localStorage.setItem('user', JSON.stringify({ ...storedUser, isOpen: data.isOpen }));
        } catch (err) {
            console.error('toggle ไม่สำเร็จ:', err);
            setToggleError('เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่');
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* สถานะร้านและปุ่มเปิด/ปิด */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5">
                    <div>
                        <p className="text-sm text-gray-500 font-bold">สถานะร้านของคุณ</p>
                        {isOpen === null ? (
                            <p className="text-lg font-bold mt-1 text-gray-400">⏳ กำลังโหลด...</p>
                        ) : (
                            <p className={`text-lg font-bold mt-1 ${isOpen ? 'text-green-500' : 'text-red-400'}`}>
                                {isOpen ? '🟢 เปิดรับออเดอร์' : '🔴 ปิดร้านชั่วคราว'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={toggling || isOpen === null}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none
                            ${isOpen ? 'bg-green-400' : 'bg-gray-300'}
                            ${(toggling || isOpen === null) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300
                                ${isOpen ? 'translate-x-8' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
                {toggleError && (
                    <p className="px-5 pb-4 text-sm text-red-500 font-bold">⚠️ {toggleError}</p>
                )}
            </div>

            {/* รายได้ */}
            <div className="p-6 text-white shadow-lg bg-gradient-to-r from-[#1a113d] to-[#2d1e5e] rounded-3xl">
                <p className="text-sm opacity-80">Total Earning</p>
                <h2 className="mt-1 text-4xl font-bold text-yellow-400">฿ 1,200</h2>
                <p className="mt-2 text-sm">มีออเดอร์รอรับ {pendingOrders.length} รายการ</p>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-bold">New Orders ({pendingOrders.length})</h3>

                {loadingOrders && <div className="text-center text-gray-400 py-4">⏳ กำลังโหลด...</div>}

                {!loadingOrders && pendingOrders.length === 0 && (
                    <div className="text-center text-gray-400 py-6 bg-white rounded-2xl">
                        <p className="text-3xl mb-2">🎉</p>
                        <p className="font-bold">ไม่มีออเดอร์รอรับ</p>
                    </div>
                )}

                <div className="space-y-3">
                    {pendingOrders.map((order) => (
                        <div key={order._id} className="p-4 bg-white shadow-sm rounded-2xl space-y-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold">👤 {order.customerId?.name || 'ลูกค้า'}</h4>
                                    <p className="text-xs text-gray-400">📞 {order.customerId?.phone || '-'}</p>
                                </div>
                                <span className="text-sm font-bold text-yellow-600">฿ {order.totalPrice}</span>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                                {order.items.map((item, i) => (
                                    <p key={i}>• {item.name} x{item.quantity}</p>
                                ))}
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={() => handleOrderStatus(order._id, 'preparing')}
                                    className="flex-1 py-2 text-sm font-bold bg-yellow-400 rounded-full text-[#1a113d] hover:bg-yellow-500 transition"
                                >
                                    ✅ Accept
                                </button>
                                <button
                                    onClick={() => handleOrderStatus(order._id, 'cancelled')}
                                    className="flex-1 py-2 text-sm font-bold bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition"
                                >
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

