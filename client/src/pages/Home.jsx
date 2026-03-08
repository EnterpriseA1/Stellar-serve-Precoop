import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NavbarRestaurant from '../components/NavbarRestaurant';

// นำเข้า Component ลูกต่างๆที่ถูกแยกไฟล์ออกไปเพื่อความเป็นระเบียบ
import CustomerDashboard from '../components/Home/CustomerDashboard';
import RestaurantDashboard from '../components/Home/RestaurantDashboard';
import CartPage from '../components/Home/CartPage';
import SearchPage from '../components/Home/SearchPage';
import MyOrdersPage from '../components/Home/MyOrdersPage';
import RestaurantOrdersPage from '../components/Home/RestaurantOrdersPage';
import MenuManagePage from '../components/Home/MenuManagePage';
import ProfilePage from '../components/Home/ProfilePage';

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

                {currentTab === 'search' && <SearchPage onSelectRestaurant={(restaurant) => { setCurrentTab('home'); }} />}
                {currentTab === 'orders' && (
                    user.role === 'restaurant' ? <RestaurantOrdersPage user={user} /> : <MyOrdersPage user={user} />
                )}
                {currentTab === 'menu' && <MenuManagePage user={user} />}
                {currentTab === 'profile' && <ProfilePage user={user} setUser={setUser} />}
            </div>

            {/* Navbar แยกตาม role */}
            {user.role === 'restaurant'
                ? <NavbarRestaurant currentTab={currentTab} setCurrentTab={setCurrentTab} />
                : <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} cartCount={cartCount} />
            }

        </div>
    );
}
